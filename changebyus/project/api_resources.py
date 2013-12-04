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

from ..helpers.flasktools import jsonify_response, ReturnStructure, as_multidict
from ..helpers.mongotools import db_list_to_dict_list

from .models import Project, Roles, ACTIVE_ROLES
from .helpers import ( _create_project, _edit_project, _get_lat_lon_from_location )

from .decorators import *

from ..user.models import User

from ..notifications.api import _notify_project_join

from .api import ( CreateProjectForm, EditProjectForm, 
                   JoinProjectForm, LeaveProjectForm )

resource_api = Blueprint('resource_api', __name__, url_prefix='/api/resource')


"""
============
Resource Api
============

Resources are really similar to projects, except we 

"""

"""
class CreateProjectForm(Form):

    name = TextField("name", validators=[Required()])
    description = TextAreaField("description", validators=[Required()])
    location = TextField("location", validators=[Required()])
    photo = FileField("photo")
"""

@resource_api.route('/create', methods = ['POST'])
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

    form = CreateProjectForm(as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    return _create_project(form, resource = True )



@resource_api.route('/slug/<project_slug>')
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
        warnStr = "Resource of slug {0} returned {1} objects.".format(project_slug,
                                                                     p.count())
        current_app.logger.warn(warnStr)

    return jsonify_response( ReturnStructure( data = p[0].as_dict() ))



@resource_api.route('/<project_id>')
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


"""
class EditProjectForm(Form):

    project_id = TextField("project_id")
    name = TextField("title",)
    description = TextAreaField("description")
    location = TextField("location")
    photo = FileField("photo")    
"""


@resource_api.route('/edit', methods = ['POST'])
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

    form = EditProjectForm(as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    return _edit_project(form)



"""
class JoinProjectForm(Form):
    project_id = TextField("project_id", validators=[Required()])
"""

@resource_api.route('/follow', methods = ['POST'])
# TODO add membership required decorator
@login_required
@project_exists
def api_join_project():
    """
    ABOUT
        Allows a user to follow a resource
    METHOD
        Post
    INPUT
        project_id
    OUTPUT
        ReturnStructure response with results
    PRECONDITIONS
        User is logged in
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
                                                  msg = 'User is already following resource.' ) )
    upl = UserProjectLink(user = user,
                          project = project,
                          role = Roles.MEMBER)
    upl.save()


    _notify_project_join( project_id = project.id,
                          user_name = user.display_name )

    from ..post.activity import update_project_activity
    update_project_activity( project_id )

    return jsonify_response( ReturnStructure( success = True) )


"""
class LeaveProjectForm(Form):
    project_id = TextField("project_id", validators=[Required()])
"""

@resource_api.route('/unfollow', methods = ['POST'])
@login_required
@project_exists
def api_leave_project():
    """
    ABOUT
        Allows a user to not follow a resource
    METHOD
        Post
    INPUT
        project id (via url)
    OUTPUT
        Currently a rendered tempalte for the project.  Should in the future return a Jsonified OK statement.
    PRECONDITIONS
        User is logged in, user is a member of the project.
    """

    form = LeaveProjectForm(as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project_id = form.project_id.data
    project = form.project.data


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


