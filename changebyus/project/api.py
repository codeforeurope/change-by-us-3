# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import (Blueprint, render_template, redirect, 
                   request, current_app, g, abort)

from flask.ext.login import login_required, current_user, login_user

from flask.ext.wtf import (Form, TextField, TextAreaField, FileField, 
                           SubmitField, Required, ValidationError)

from ..geonames import get_geopoint

from ..helpers.flasktools import jsonify_response, ReturnStructure
from ..helpers.mongotools import db_list_to_dict_list

from ..mongo_search import search

from .models import Project, Roles, ACTIVE_ROLES
from .helpers import ( _get_users_for_project, _get_user_joined_projects, 
                       _create_project, _edit_project, _get_lat_lon_from_location )

from .decorators import *

from ..stripe.models import StripeAccount
from ..stripe.api import _get_account_balance_percentage

from ..user.models import User

from ..notifications.api import _notify_project_join

from flaskext.uploads import UploadNotAllowed
from mongoengine.connection import _get_db
from urlparse import urlparse

project_api = Blueprint('project_api', __name__, url_prefix='/api/project')


"""
===========
Project Api
===========

Projects are the heart of the CBU website.  Projects incorporate funding, members,
images, etc.

"""

@project_api.route('/geopoint')
def api_get_geopoint():
    """
    returns a list of names and lat/lon
    """
    s = request.args.get('s')
    
    data = get_geopoint(s)
    
    return jsonify_response(ReturnStructure(data = data))

@project_api.route('/search')
def api_search_projects():
    """
    ABOUT
        search projects and/or resources
    METHOD
        GET
    INPUT
        s = text to search
        loc = location to search
        d = radius from location (assumes miles)
        cat = category to search
        type = 'project' or 'resource' (searches both if omitted)
    OUTPUT
        ReturnStructure response with outcome results.
    PRECONDITIONS
        None
    """    
    text = request.args.get('s')
    loc = request.args.get('loc')
    geo_dist = request.args.get('d')
    cat = request.args.get('cat')
    search_type = request.args.get('type')
    
    latlon = _get_lat_lon_from_location(loc)
    geo_center = [latlon[0], latlon[1]]
    
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


class CreateProjectForm(Form):

    name = TextField("name", validators=[Required()])
    description = TextAreaField("description", validators=[Required()])
    location = TextField("location", validators=[Required()])
    photo = FileField("photo")


@project_api.route('/create', methods = ['POST'])
@login_required
def api_create_project():
    """
    ABOUT
        Create a project.
    METHOD
        Post
    INPUT
        Name, Description, Location, photo (as file)
    OUTPUT
        ReturnStructure response with outcome results.
    PRECONDITIONS
        User is logged in
    """

    form = CreateProjectForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    return _create_project()


@project_api.route('/slug/<project_slug>')
@project_exists
def api_get_project_slug(project_slug):
    """
    ABOUT
        Gets information on a given project via slug name
    METHOD
        GET
    INPUT
        project id
    OUTPUT
        ReturnStructure response with outcome results.
    PRECONDITIONS
        None
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
    """
    ABOUT
        Gets information on a given project
    METHOD
        GET
    INPUT
        project id
    OUTPUT
        ReturnStructure response with outcome results.
    PRECONDITIONS
        None
    """
    p = Project.objects.with_id(project_id)

    return jsonify_response( ReturnStructure( data = p.as_dict() ))


class EditProjectForm(Form):

    project_id = TextField("project_id")
    name = TextField("title",)
    description = TextAreaField("description")
    location = TextField("location")
    photo = FileField("photo")    


@project_api.route('/edit', methods = ['POST'])
@login_required
@project_exists
@project_organizer
def api_edit_project():
    """
    ABOUT
        Edit an existing project
    METHOD
        Post
    INPUT
        project_id (required), name, description, location, photo
    OUTPUT
        Json representation of the modified project.
    PRECONDITIONS
        User is logged in and owns the project
    """

    form = EditProjectForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    return _edit_project()



@project_api.route('/<project_id>/users')
# return a list of users given a project
@login_required
@project_exists
def api_view_project_users(project_id):
    """
    ABOUT
        Get a list of users who belong to a given project
    METHOD
        Get
    INPUT
        project_id
    OUTPUT
        Json list of user objects
    PRECONDITIONS
        User is logged in
    """

    users = _get_users_for_project(project_id)

    return jsonify_response( ReturnStructure( data = users ))


@project_api.route('/user/<user_id>/ownedprojects')
@login_required
def api_owned_projects(user_id):
    """
    ABOUT
        Get a list of projects owned by a given user
    METHOD
        Get
    INPUT
        user_id
    OUTPUT
        Json list of project objects
    PRECONDITIONS
        User is logged in
    """
    projects = _get_user_owned_projects(user_id)

    return jsonify_response( ReturnStructure( data = projects ) )


@project_api.route('/user/<user_id>/joinedprojects')
@login_required
# TODO should we restrict this further than login required?
def api_joined_projects(user_id):
    """
    ABOUT
        Get a list of projects a user has joined
    METHOD
        Get
    INPUT
        user_id
    OUTPUT
        Json list of project objects
    PRECONDITIONS
        User is logged in
    """

    # TODO fix this
    pList = _get_user_joined_projects(user_id)

    return jsonify_response( ReturnStructure( data = pList ) )



@project_api.route('/<project_id>/users_and_common_projects')
# return a list of users given a project and projects in common
@login_required
@project_exists
def api_view_project_users_common_projects(project_id):
    """
    ABOUT
        Get a list of users in a project and the projects they have in common
        with the currently logged in user
        list of [user, projects]
    METHOD
        Get
    INPUT
        project_id
    OUTPUT
        Json list of users and their common projects
    PRECONDITIONS
        User is logged in
    """
    return_list = _get_project_users_and_common_projects(project_id=project_id, 
                                                         user_id=g.user.id)

    return jsonify_response( ReturnStructure( data = return_list ) )


@project_api.route('/list')
def api_get_projects():
    """
    ABOUT
        Simple list of projects, optionally sorted and limited
    METHOD
        Get
    INPUT
        limit, sort, order
    OUTPUT
        Json list of projects.  
    PRECONDITIONS
        None
    """
    limit = int(request.args.get('limit', 100))
    sort = request.args.get('sort')
    order = request.args.get('order', 'asc')

    if (sort):
        sort_order = "%s%s" % (("-" if order == 'desc' else ""), sort)
        projects = Project.objects.order_by(sort_order)
    else:
        projects = Project.objects()

    projects = projects[0:limit]
    projects_list = db_list_to_dict_list(projects)

    return jsonify_response( ReturnStructure( data = projects_list ) )


class JoinProjectForm(Form):
    project_id = TextField("project_id", validators=[Required()])

@project_api.route('/join', methods = ['POST'])
# TODO add membership required decorator
@login_required
@project_exists
def api_join_project():
    """
    ABOUT
        Allows a user to join a project
    METHOD
        Post
    INPUT
        project_id
    OUTPUT
        ReturnStructure response with results
    PRECONDITIONS
        User is logged in
    """

    form = JoinProjectForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = request.form.get('project_id')

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


class LeaveProjectForm(Form):
    project_id = TextField("project_id", validators=[Required()])

@project_api.route('/leave', methods = ['POST'])
@login_required
@project_exists
def api_leave_project():
    """
    ABOUT
        Allows a user to leave a project
    METHOD
        Post
    INPUT
        project id (via url)
    OUTPUT
        Currently a rendered tempalte for the project.  Should in the future return a Jsonified OK statement.
    PRECONDITIONS
        User is logged in, user is a member of the project.
    """

    form = LeaveProjectForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = request.form.get('project_id')
    project = Project.objects.with_id(project_id)


    if project.owner.id == g.user.id:
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = 'Project owner can not leave the project.' ) )
    
    links = UserProjectLink.objects( user = g.user.id,
                                    project = project_id)


    if links.count() == 0:
        return jsonify_response( ReturnStructure( success = True,
                                                  msg = 'User was not involved in project.' ) )
    if links.count() > 1:
        warnStr = "Warning, user {0} has multiple user_project_links on project {1}".format(g.user.id,
                                                                                            project_id)
        current_app.logger.warn(warnStr)

    for link in links:
        link.delete()

    update_project_activity( project_id )

    return jsonify_response( ReturnStructure( ) )



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

    form = ChangeUserRoleForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = request.form.get('project_id')
    user_id = request.form.get('user_id')
    role = request.form.get('user_role').upper()

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

