# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import (Blueprint, render_template, redirect, 
                   request, current_app, g, abort)

from flask.ext.login import login_required, current_user, login_user

from flask.ext.wtf.html5 import URLField
from flask.ext.wtf import (Form, TextField, TextAreaField, FileField, HiddenField,
                           SubmitField, Required, ValidationError, BooleanField)

from changebyus.geonames import get_geopoint, get_geoname

from changebyus.helpers.flasktools import jsonify_response, ReturnStructure, as_multidict
from changebyus.helpers.mongotools import db_list_to_dict_list

from changebyus.mongo_search import search

from .models import Project, Roles, ACTIVE_ROLES, UserProjectLink, ProjectCategory, ProjectCity


from .helpers import ( _approve_project,
                       _delete_project, _get_users_for_project, _get_user_joined_projects, _get_project_users_and_common_projects,
                       _get_user_roles_for_project, _create_project, _edit_project, _get_lat_lon_from_location, _delete_cal,
                       _get_user_owned_projects, _leave_project, _unflag_project )

from .decorators import ( _is_member, _is_organizer, _is_owner, project_exists,
                          project_member, project_ownership, project_organizer,
                          valid_project_membership )

from changebyus.user.decorators import is_site_admin
from changebyus.user.models import User

from changebyus.notifications.api import _notify_project_join

from changebyus.stripe.api import _get_account_balance_percentage, _update_goal_description
from changebyus.stripe.models import StripeAccount

from flaskext.uploads import UploadNotAllowed
from mongoengine.connection import _get_db
from mongoengine.errors import ValidationError

from urlparse import urlparse

project_api = Blueprint('project_api', __name__, url_prefix='/api/project')
resource_api = Blueprint('resource_api', __name__, url_prefix='/api/resource')

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


@project_api.route('/geoname')
def api_get_geoname():
    """
    returns a list of names and lat/lon
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    data = get_geoname(lat, lon)
    
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

    text = request.json.get('s')
    geo_dist = request.json.get('d')
    lat = request.json.get('lat')
    lon = request.json.get('lon')
    cat = request.json.get('cat')
    search_type = request.json.get('type')
    
    geo_center = [lon, lat]
    
    addl_filters = {'active':True}

    if (lat is 0 and lon is 0):
        geo_dist = 25000
    
    if (cat != ""):
        addl_filters.update({"category": cat})
    
    if (search_type == 'resource'):
        addl_filters.update({"resource": True, "approved": True})
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


@project_api.route('/cities')
def api_cities():
    cities = ProjectCity.objects(active=True)
    
    data = {"cities": db_list_to_dict_list(cities)}
    
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
    website = URLField("website")
    gcal_code = TextField("gcal_code")
    location = HiddenField("location")
    lat = HiddenField("lat")
    lon = HiddenField("lon")
    photo = FileField("photo")
    resource = HiddenField("resource")
    private = BooleanField("private")

@project_api.route('/create', methods = ['POST'])
@login_required
def api_create_project():
    """Creates a project
        
        Args:
            Name: Name of the project
            Description: Description of the project
            Location: Location of the project
            location:
            lat:
            lon:
            Photo: Image file to associate with the project
            resource: 

        Returns:
            Project if successfully created
    """

    form = CreateProjectForm(request.form or as_multidict(request.json))

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
# @valid_project_membership
def api_get_project(project_id):
    """Get project by project_id

        Args:
            project_id: project id or slug to look up

        Returns:
            Project if it exists
    """
    try:
        project = Project.objects.with_id(project_id)
        # project.count()
    except ValidationError as e:
        # we passed the decorator so let this error drop through
        project = Project.objects(slug=project_id).first()
        # overwrite the slug with the project_id
        project_id = project.id

    if project.stripe_account:
        stripe_account_id = project.stripe_account.id
        account = StripeAccount.objects.with_id(stripe_account_id)

        if account is not None:
            project.stripe_account = account

    return jsonify_response( ReturnStructure( data = project.as_dict() ))


class EditProjectForm(Form):

    project_id = TextField("project_id")
    name = TextField("title",)
    description = TextAreaField("description")
    website = URLField("website")
    category = TextField("category")
    gcal_code = TextField("gcal_code")
    location = HiddenField("location")
    lat = HiddenField("lat")
    lon = HiddenField("lon")
    photo = FileField("photo")    
    private = BooleanField("private")
    

@project_api.route('/<project_id>', methods = ['DELETE'])
@project_api.route('/remove', methods = ['POST'])
@resource_api.route('/<project_id>', methods = ['DELETE'])
@resource_api.route('/remove', methods = ['POST'])
@is_site_admin
def api_delete_project(project_id=None):
    if (not project_id):
        form = request.form if request.form else as_multidict(request.json)
        project_id = form.get('project_id')
    
    _delete_project(project_id)
    
    return jsonify_response(ReturnStructure())
        

@project_api.route('/<project_id>/approve', methods = ['POST'])
@resource_api.route('/<project_id>/approve', methods = ['POST'])
@is_site_admin
def api_approve_project(project_id):
    _approve_project(project_id)
    
    return jsonify_response( ReturnStructure() )


@project_api.route('/<project_id>/unflag', methods = ['POST'])
@resource_api.route('/<project_id>/unflag', methods = ['POST'])
@is_site_admin
def api_unflag_project(project_id=None):    
    _unflag_project(project_id)
    
    return jsonify_response(ReturnStructure())


@project_api.route('/<project_id>/delete_calendar')
@login_required
@project_exists
@project_organizer
def api_delete_calendar(project_id):
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

    return _delete_cal(project_id)


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

    form = EditProjectForm(request.form or as_multidict(request.json))
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


@project_api.route('/review', methods = ['POST'])
def api_review_info():
    """
    ABOUT
        Renders a template that lets user review and confirm fundraising details
        such as amount, description, etc
    METHOD
        POST
    INPUT
        account_id, project_id, goal, description
    OUTPUT
        Rendered template for funrasise_review
    PRECONDITIONS
        User logged in
    """
 
    account_id = request.form.get('account_id')
    project_id = request.form.get('project_id')
    funding_goal = request.form.get('goal')
    description = request.form.get('description')
    project = Project.objects.with_id(project_id)

    
    _update_goal_description(account_id, funding_goal, description)
    balance, percentage = _get_account_balance_percentage(account_id)

    
    if g.user.id != project.owner.id:
        warnStr = "User {0} tried to review fundraising on project {1}".format(g.user.id, project_id)
        current_app.logger.warning(warnStr)
        abort(401)
    
    # we want to pass the fundraiser view the small 160x50 image
    project_dict = project.as_dict()
    project_image = project_dict['image_url_small_square']
    

    return jsonify_response( ReturnStructure( data = {'funding':funding_goal, 'project_id':project_id, 'description':description, 'name':project.name, 
                               'image_url':project_image, 'balance':balance, 'percentage':percentage}) )


@project_api.route('/user/<user_id>/owned-projects')
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


@project_api.route('/list')
def api_get_projects():
    """Returns a simple list of projects, optionally sorted and limited
   
        Args:
            limit: limit of number of projects to return
            sort: sort parameter
            order: order by parameter

        Returns:
            list of project dictionaries

    """
    limit = int(request.args.get('limit', 100))
    sort = request.args.get('sort')
    order = request.args.get('order', 'asc')
    
    # using raw query here so that most list queries aren't needlessly 
    # using flags__gt=-1 or something
    query = {"active":True}
    
    if (request.args.get('is_resource')):
        query.update({'resource': True, 'approved': True})

    if bool(request.args.get('flagged', False)):
        query['flags'] = {"$gt":0}

    if (sort):
        sort_order = "%s%s" % (("-" if order == 'desc' else ""), sort)
        projects = Project.objects(__raw__=query).order_by(sort_order)
    else:
        projects = Project.objects(__raw__=query)

    projects = projects[0:limit]
    projects_list = db_list_to_dict_list(projects)

    return jsonify_response( ReturnStructure( data = projects_list ) )


@resource_api.route('/list/<status>')
@is_site_admin
def api_get_resources(status='approved'):
    """
    Returns list of unapproved resources
    """
    limit = int(request.args.get('limit', 100))
    sort = request.args.get('sort')
    order = request.args.get('order', 'asc')
    
    is_approved = (status != 'unapproved')
    
    if (sort):
        sort_order = "%s%s" % (("-" if order == 'desc' else ""), sort)
        resources = Project.objects(active=True, resource=True, approved=is_approved).order_by(sort_order)
    else:
        resources = Project.objects(active=True, resource=True, approved=is_approved)

    resources = resources[0:limit]
    resources_list = db_list_to_dict_list(resources)

    return jsonify_response( ReturnStructure( data = resources_list ) )


class JoinProjectForm(Form):
    project_id = TextField("project_id", validators=[Required()])

@project_api.route('/join', methods = ['POST'])
@login_required
@project_exists
def api_join_project():
    """Allows logged in user to join a project

        Args:
            project_id: the id of the project to join

        Returns:
            True if join successful
    """

    form = JoinProjectForm(request.form or as_multidict(request.json))
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

    form = RemoveMemberForm(request.form or as_multidict(request.json))
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

    form = LeaveProjectForm(request.form or as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = form.project_id.data

    return _leave_project(project_id=project_id, user_id=g.user.id)



@project_api.route('/<project_id>/user/<user_id>')
@project_exists
@login_required
def api_query_user_roll(project_id, user_id):
    """Query the role(s) a user plays in a given project
    
        Args:
            project_id: id of the project in question
            user_id: user id of the user in question

        Returns:
            Dict containing role type and True/False indicating their level of involvement
    """

    member = _is_member(project_id, user_id)
    owner = _is_owner(project_id, user_id)
    organizer = _is_organizer(project_id, user_id)

    return jsonify_response( ReturnStructure( data = { 'member' : member,
                                                       'owner' : owner,
                                                       'organizer' : organizer } ))


class ChangeUserRoleForm(Form):
    project_id = TextField("project_id", validators=[Required()])
    user_id = TextField("user_id", validators=[Required()])
    user_role = TextField("user_role", validators=[Required()])

@project_api.route('/change-user-role', methods = ['POST'])
@login_required
@project_exists
@project_organizer
def api_change_user_role():
    """Allows a organizer/owner of project to change another project members role

        Args:
            project_id: project id to change user role in
            user_id: id of the user whose role will be changed
            user_role: role type to give to the user.  'owner', 'organizer', 'member'

        Returns:
            True if role is successfully changed.

    """

    form = ChangeUserRoleForm(request.form or as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = form.project_id.data
    user_id = form.user_id.data
    role = form.user_role.data.upper()

    if role not in ACTIVE_ROLES:
        errStr = "role_name was not one of {0} "+", ".join(ACTIVE_ROLES)
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

