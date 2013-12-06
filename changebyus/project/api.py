# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import (Blueprint, render_template, redirect, 
                   request, current_app, g, abort)

from flask.ext.login import login_required, current_user, login_user

from flask.ext.wtf import (Form, TextField, TextAreaField, FileField, HiddenField,
                           SubmitField, Required, ValidationError)

from ..geonames import get_geopoint

from ..helpers.flasktools import jsonify_response, ReturnStructure, as_multidict
from ..helpers.mongotools import db_list_to_dict_list

from ..mongo_search import search

from .models import Project, Roles, ACTIVE_ROLES, UserProjectLink, ProjectCategory

from .helpers import ( _get_users_for_project, _get_user_joined_projects, _get_project_users_and_common_projects,
                       _get_user_roles_for_project, _create_project, _edit_project, _get_lat_lon_from_location,
                       _get_user_owned_projects, _leave_project )

from .decorators import ( _is_member, _is_organizer, _is_owner, project_exists,
                          project_member, project_ownership, project_organizer )

from ..stripe.models import StripeAccount
from ..stripe.api import _get_account_balance_percentage

from ..user.models import User

from ..notifications.api import _notify_project_join

from flaskext.uploads import UploadNotAllowed
from mongoengine.connection import _get_db
from urlparse import urlparse

project_api = Blueprint('project_api', __name__, url_prefix='/api/project')

"""
.. module:: project/api

    :synopsis: Projects include members and funding

"""

## TODO WTForms for geopoint?

@project_api.route('/geopoint')
def api_get_geopoint():
    """
    returns a list of names and lat/lon
    """
    s = request.args.get('s')
    
    data = get_geopoint(s)
    
    return jsonify_response(ReturnStructure(data = data))


## TODO WTForms for search?

@project_api.route('/search', methods = ['POST', 'GET'])
def api_search_projects():
    """Search projects and/or resources

        Args:
            s = text to search
            loc = location to search
            d = radius from location (assumes miles)
            cat = category to search
            type = 'project' or 'resource' (searches both if omitted)

        Returns:
            list of search results
    """    

    text = request.args.get('s')
    geo_dist = request.args.get('d')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    cat = request.args.get('cat')
    search_type = request.args.get('type')
    
    geo_center = [lon, lat]
    
    addl_filters = {}
    
    if (cat):
        addl_filters.update({"category": cat})
    
    if (search_type == 'resource'):
        addl_filters.update({"resource": True})
    if (search_type == 'project'):
        addl_filters.update({"resource": False})
    
    search_data = search(db = _get_db(),
                         collection = "project", 
                         text = text, 
                         geo_field = "geo_location", 
                         geo_center = geo_center, 
                         geo_dist = geo_dist, 
                         addl_filters = addl_filters,
                         fields = ['name', 'resource', 'geo_location', 'activity'],
                         units = 'mi')

    return jsonify_response(ReturnStructure(data = search_data))
    

@project_api.route('/categories')
def api_categories():
    cats = ProjectCategory.objects(active=True)
    
    data = {"categories": [c.name for c in cats]}
    
    return jsonify_response(ReturnStructure(data = data))


# TODO WTForms for flagging?

@project_api.route('/<project_id>/flag', methods = ['POST'])
@project_exists
@login_required
def api_flag_project(project_id):
    p = Project.objects.with_id(project_id)
    
    p.flags += 1
    p.save()

    return jsonify_response(ReturnStructure())


class CreateProjectForm(Form):

    name = TextField("name", validators=[Required()])
    description = TextAreaField("description", validators=[Required()])
    category = TextField("category")
    gcal_code = TextField("gcal_code")
    location = HiddenField("location")
    lat = HiddenField("lat")
    lon = HiddenField("lon")
    photo = FileField("photo")


@project_api.route('/create', methods = ['POST'])
@login_required
def api_create_project():
    """Creates a project
        
        Args:
            Name: Name of the project
            Description: Description of the project
            Location: Location of the project
            Photo: Image file to associate with the project

        Returns:
            Project if successfully created
    """

    form = CreateProjectForm(as_multidict(request.json))

    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    return _create_project(form)


@project_api.route('/slug/<project_slug>')
@project_exists
def api_get_project_slug(project_slug):
    """Get project by the slug name

        Args:
            project_slug: project slug id to look up

        Returns:
            Project if it exists
    """
    p = Project.objects(slug = project_slug)

    if p.count() == 0 or p.count() > 1:
        warnStr = "Project of slug {0} returned {1} objects.".format(project_slug,
                                                                     p.count())
        current_app.logger.warn(warnStr)

    return jsonify_response( ReturnStructure( data = p[0].as_dict() ))


@project_api.route('/<project_id>')
@project_exists
def api_get_project(project_id):
    """Get project by project_id

        Args:
            project_id: project id to look up

        Returns:
            Project if it exists
    """
    p = Project.objects.with_id(project_id)

    return jsonify_response( ReturnStructure( data = p.as_dict() ))


class EditProjectForm(Form):

    project_id = TextField("project_id")
    name = TextField("title",)
    description = TextAreaField("description")
    category = TextField("category")
    gcal_code = TextField("gcal_code")
    location = HiddenField("location")
    lat = HiddenField("lat")
    lon = HiddenField("lon")
    photo = FileField("photo")    


@project_api.route('/edit', methods = ['POST'])
@login_required
@project_exists
@project_organizer
def api_edit_project():
    """Edit an existing project
 
        All arguments except project_id are optional

        Args:
            project_id: id of the project to edit
            name: New name of the project
            description: New description of the project
            location: New location of the project
            photo: New image file to associate with the project
    
        Returns:
            Resultant project structure
    """

    form = EditProjectForm(as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    return _edit_project(form)



@project_api.route('/<project_id>/users')
@project_exists
def api_view_project_users(project_id):
    """Get a list of users who belong to a given project

        Args:
            project_id: id of the project
   
        Returns:
            list users and their roles
    """

    users = _get_users_for_project(project_id)

    for u in users:
        upls = _get_user_roles_for_project(project_id, u['id'])
        if upls.count() > 0:
            for upl in upls:
                u['roles'].append(upl['role'])

    return jsonify_response( ReturnStructure( data = users ))



@project_api.route('/user/<user_id>/ownedprojects')
@login_required
def api_owned_projects(user_id):
    """Get a list of projects owned by a given user
    
        Args:
            user_id: id of the user

        Returns:
            list of project dict objects
    """
    projects = _get_user_owned_projects(user_id)

    return jsonify_response( ReturnStructure( data = projects ) )



@project_api.route('/user/<user_id>/joined-projects')
@login_required
def api_joined_projects(user_id):
    """Get a list of projects a user has joined

        Args:
            user_id: the user id of the user

        Returns:
            list of project dictionaries
    """

    pList = _get_user_joined_projects(user_id)

    return jsonify_response( ReturnStructure( data = pList ) )



@project_api.route('/<project_id>/users-and-common-projects')
@login_required
@project_exists
def api_view_project_users_common_projects(project_id):
    """
        Get a list of users in a project and the projects they have in common
        with the currently logged in user
    
        Args:
            project_id: project id to query for common users/projects within

        Returns:
            list of [user, projects], showing the user and the projects you have
            in common with them
    """

    return_list = _get_project_users_and_common_projects(project_id=project_id, 
                                                         user_id=g.user.id)

    return jsonify_response( ReturnStructure( data = return_list ) )


class JoinProjectForm(Form):
    project_id = TextField("project_id", validators=[Required()])

@project_api.route('/join', methods = ['POST'])
# TODO add membership required decorator
@login_required
@project_exists
def api_join_project():
    """Allows logged in user to join a project

        Args:
            project_id: the id of the project to join

        Returns:
            True if join successful
    """

    form = JoinProjectForm(as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = form.project_id.data

    user = User.objects.with_id(g.user.id)
    project = Project.objects.with_id(project_id)

    old_upl = UserProjectLink.objects(user = user,
                                      project = project)


    if project.owner == user or old_upl.count() == 1:
        return jsonify_response( ReturnStructure( success = True,
                                                  msg = 'User is already invoved in project.' ) )
    upl = UserProjectLink(user = user,
                          project = project,
                          role = Roles.MEMBER)
    upl.save()

    _notify_project_join( project_id = project.id,
                          user_name = user.display_name)

    from ..post.activity import update_project_activity
    update_project_activity( project_id )

    return jsonify_response( ReturnStructure( success = True) )



class RemoveMemberForm(Form):
    project_id = TextField("project_id", validators=[Required()])
    user_id = TextField("user_id", validators=[Required()])    

@project_api.route('/remove-member', methods = ['POST'])
@login_required
@project_exists
@project_organizer
def remove_project_user():
    """Allows an organizer/owner to remove a member from a project

        Args:
            project_id: project to remove the member from
            user_id: the user id of the member to remove

        Returns:
            True if removal correct
    """    

    form = RemoveMemberForm(as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = form.project_id.data
    user_id = form.user_id.data

    infoStr = "User {0} is attempting removal of user {1} on project {2}.".format(g.user.id,
                                                                                  user_id,
                                                                                  project_id)
    current_app.logger.info(infoStr)

    return _leave_project(project_id=project_id, user_id=user_id)


class LeaveProjectForm(Form):
    project_id = TextField("project_id", validators=[Required()])

@project_api.route('/leave', methods = ['POST'])
@login_required
@project_exists
def api_leave_project():
    """Allows a user to leave a project
    
        Args:
            project_id: id of project currently logged in user wants to leave 

        Returns:
            True if user left project
    """

    form = LeaveProjectForm(as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = form.project_id.data

    return _leave_project(project_id=project_id, user_id=g.user.id)


@project_api.route('/am_i_a_member/<project_id>')
@project_exists
@login_required
def api_is_user_member(project_id):

    if _is_member(project_id, g.user.id):
        return jsonify_response( ReturnStructure( data = {'member' : True } ))
    else:
        return jsonify_response( ReturnStructure( data = {'member' : False } ))


@project_api.route('/am_i_an_organizer/<project_id>')
@project_exists
@login_required
def api_is_user_organizer(project_id):

    if _is_organizer(project_id, g.user.id):
        return jsonify_response( ReturnStructure( data = {'organizer' : True } ))
    else:
        return jsonify_response( ReturnStructure( data = {'organizer' : False } ))




class ChangeUserRoleForm(Form):
    project_id = TextField("project_id", validators=[Required()])
    user_id = TextField("user_id", validators=[Required()])
    user_role = TextField("user_role", validators=[Required()])

@project_api.route('/change_user_role', methods = ['POST'])
@login_required
@project_exists
@project_organizer
def api_change_user_role():
    """
    ABOUT
        Allows a organizer of project to change another project members role
    METHOD
        Post
    INPUT
        project_id
        user_id
        user_role
    OUTPUT
        ReturnStructure response with results
    PRECONDITIONS
        User is logged in, user is an organizer of the project.
    """

    form = ChangeUserRoleForm(as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = form.project_id.data
    user_id = form.user_id.data
    role = form.user_role.data

    if role not in ACTIVE_ROLES:
        errStr = "role_name was not one of {0}".ACTIVE_ROLES
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ) )

    project = Project.objects.with_id(project_id)

    if project.owner.id == user_id:
        errStr = "Can not change project owner role."
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr) ) 

    upl = UserProjectLink.objects( user = user_id,
                                   project = project_id )
    
    if upl.count() == 0:
        msg = "User is not involved in project."
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = msg ) )

    updated_link = upl[0]
    updated_link.role = role
    updated_link.save()

    return jsonify_response( ReturnStructure( ) )

