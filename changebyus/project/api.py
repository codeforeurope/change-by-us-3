# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import (Blueprint, render_template, redirect, 
                   url_for, request, current_app, g, abort)

from flask.ext.login import login_required, current_user, login_user

from flask.ext.wtf import (Form, TextField, TextAreaField, FileField, 
                           SubmitField, Required, ValidationError)


from ..helpers.flasktools import jsonify_response, ReturnStructure
from ..helpers.mongotools import db_list_to_dict_list
from ..helpers.imagetools import generate_thumbnails

from .models import Project, Roles, Role
from .helpers import _get_users_for_project
from .decorators import *

from ..stripe.models import StripeAccount
from ..stripe.api import _get_account_balance_percentage

from ..user.models import User

from flaskext.uploads import UploadNotAllowed

from urlparse import urlparse

project_api = Blueprint('project_api', __name__, url_prefix='/api/project')



"""
===========
Project Api
===========

Projects are the heart of the CBU website.  Projects incorporate funding, members,
images, etc.

"""

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
        Currently it redirects to the project_view_id template, but this needs
        to be corrected so it returns a Json object representing the project.
        If no image is uploaded the default image (specified in 
        config.yml:DEFAULT_PROJECT_IMAGE will be used
    PRECONDITIONS
        User is logged in
    TODO
        This should be returned to a pure api form and only return the Json object
    """

    form = CreateProjectForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    name = request.form.get('name')
    description = request.form.get('description')
    location = request.form.get('location')

    owner = User.objects.with_id(g.user.id)

    image_uri = None

    # TODO TODO cloudize our photos

    # photo is optional
    if 'photo' in request.files:
        photo = request.files.get('photo')

        if len(photo.filename) > 3:

            try:
                filename = current_app.uploaded_photos.save(photo)
                filepath = current_app.uploaded_photos.path(filename)
                generate_thumbnails(filepath)
            except UploadNotAllowed:
                abort(403)

            image_uri = urlparse(current_app.uploaded_photos.url(filename)).path

        else:
            # again, photo optional
            image_uri = None


    project = Project.objects(name=name)
    if project.count() > 0:
        errStr = "Sorry, the name '{0}' is already in use.".format(name)
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    # TODO verify all info
    p = Project( name = name, 
                 description = description, 
                 municipality = municipality, 
                 owner = owner)

    if image_uri:
        p.image_uri = image_uri

    p.save()
    infoStr = "User {0} has created project called {1}".format(g.user.id, name)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( success = True,
                                              msg = 'OK',
                                              data = p.as_dict() ))


@project_api.route('/<id>')
@project_exists
def api_get_project(project_id):
    """
    ABOUT
        Gets information on a given object
    METHOD
        GET
    INPUT
        project id
    OUTPUT
        Json representation of the project
    PRECONDITIONS
        None
    """
    p = Project.objects.with_id(project_id)

    return jsonify_response( ReturnStructure( success = False,
                                              msg = "Not Found" ))


class EditProjectForm(Form):

    name = TextField("title", validators=[Required()])
    description = TextAreaField("description", validators=[Required()])
    location = TextField("location", validators=[Required()])
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
    TODO
        Test to be sure the type of object comparison we use functions, test in general
    """

    project_id = request.form.get('project_id')
    name = request.form.get('name')
    description = request.form.get('description')
    municipality = request.form.get('location')

    p = Project.objects.with_id(project_id)

    if name:
        name_text = Project.objects(name = name)
        if name_text.count() > 0 and name_text[0] != p:
            msg = "Project name {0} is already in use.".format(name)
            return jsonify_response( ReturnStructure( success = False,
                                                  msg = msg ))

    if name: p.name = name
    if description: p.description = description
    if municipality: p.municipality = municipality


    # TODO cloudize this and remove the dupe code
    if 'photo' in request.files:
        photo = request.files.get('photo')

        if len(photo.filename) > 3:

            try:
                filename = current_app.uploaded_photos.save(photo)
                filepath = current_app.uploaded_photos.path(filename)
                generate_thumbnails(filepath)
            except UploadNotAllowed:
                abort(403)

            p.image_uri = urlparse(current_app.uploaded_photos.url(filename)).path


    p.save()

    infoStr = "User {0} has edited project {1} with request {2}".format(g.user.id,
                                                                        project_id,
                                                                        str(request.form))
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( success = True,
                                              msg = 'OK',
                                              data = p.as_dict() ))



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

    return jsonify_response( ReturnStructure( success = True,
                                              msg = 'OK',
                                              data = users ))


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

    return jsonify_response( ReturnStructure( success = True,
                                              msg = 'OK',
                                              data = projects ) )


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

    return jsonify_response( ReturnStructure( success = True,
                                              msg = 'OK',
                                              data = projects ) )


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

    return jsonify_response( ReturnStructure( success = True,
                                              msg = 'OK',
                                              data = return_list ) )


@project_api.route('/list')
def api_get_projects(limit = None, municipality = None, alphabetical = None):
    """
    ABOUT
        Lists all projects, given certain search parameters
    METHOD
        Get
    INPUT
        Options Python only (not web facing) limit, municiplaity, alphabetical
    OUTPUT
        Json list of projects.  Filtered by limit (max number of returns),
        mulicipality (location), and alphabetical (True/False)
    PRECONDITIONS
        None
    TODO
        When we move away from simple zip code and into proper location search
        we will need to upgrade this search routine accordingly.  Most likely
        this part of the project will incorporate elastic search, or if mongodb
        grows in geo and string searching capabilities it could remain native to 
        mongodb
    """

    projects = Project.objects()
    projects_list = db_list_to_dict_list(projects)

    return jsonify_response( ReturnStructure( success = True,
                                              msg = 'OK',
                                              data = projects_list ) )

    """
    # TODO add filtering / max / etc

    if limit is None:
        limit = int(request.args['limit']) if 'limit' in request.args else None
    if municipality is None:
        municipality = request.args['municipality'] if 'municipality' in request.args else None
    if alphabetical is None:
        alphabetical = True if 'alphabetical' in request.args else False

    # convert logic to mongoengine logic
    orderby = "name" if alphabetical else "-created_at"

    if municipality:
        if limit:
            projects = Project.objects(municipality__icontains=municipality).order_by(orderby).limit(limit)
        else:
            projects = Project.objects(municipality__icontains=municipality).order_by(orderby)
    else:
        if limit:
            projects = Project.objects().order_by(orderby).limit(limit)
        else:
            projects = Project.objects().order_by(orderby)
    
    
    pList = []
    for p in projects:
        pList.append( p.as_dict())

    return pList

    #return gen_ok( jsonify(projects=pList))
    """


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
        Currently a rendered tempalte for the project.  Should in the future return a Jsonified OK statement.
    PRECONDITIONS
        User is logged in
    TODO
        Convert to a pure API routine where we only join the user and return a status code
    """
    project_id = request.form.get('project_id')

    project = Project.objects.with_id(project_id)
    roles = project.roles
    
    if roles.has_key(g.user.id):
        role = roles[g.user.id]

        return jsonify_response( ReturnStructure( success = True,
                                                  msg = 'User is already invoved in project.',
                                                  data = role ) )

    user = User.objects.with_id(g.user.id)

    role = Role(user = user,
                name = Roles.MEMBER,
                description = "Project Member")

    project.roles[g.user.id] = role
    project.save()

    infoStr = "User {0} joined project {1}.".format(g.user.id, project_id)
    current_app.logger.info(infoStr)

    
    return jsonify_response( ReturnStructure( success = True,
                                              msg = 'User joined project.',
                                              data = role ) )

    """
    project = Project.objects.with_id(id)
    user = User.objects.with_id(g.user.id)

    if project.owner == user:
        return forbidden_request("Owner can not join their own project.")

    old_upl = UserProjectLink.objects(user = user,
                                      project = project)

    if old_upl.count() > 0:

        if old_upl.count() > 1:
            errStr = "Multiple project links for user {0} and project {1}".format(user.id,
                                                                                  project.id)
            current_app.logger.error(errStr)

        doc = old_upl.first()
        doc.user_left = False
        doc.save()

    else:

        upl = UserProjectLink(user = user,
                              project = project,
                              user_left = False)

        upl.save()

    #return gen_blank_ok()
    return redirect(url_for('project_view.project_view_id', id = project.id))
    """


@project_api.route('/<id>/leave', methods = ['POST'])
@login_required
def api_leave_project(id):
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
    TODO
        Convert to a pure API routine where we only unjoin the user and return a status code
    """

    return jsonify_response( ReturnStructure( success = False,
                                          msg = 'Not Implemented Yet',
                                          data = projects_list ) )
    
    """
    link = UserProjectLink.objects( user = g.user.id,
                                    project = id)

    if link.count() > 0:
        if link.count() > 1:
            errStr = "Multiple project links for user {0} and project {1}".format(user.id,
                                                                                  project.id)
            current_app.logger.error(errStr)

        doc = link.first()
        doc.user_left = True
        doc.save()

    
    # TODO we should error if they aren't part of the project
    # return gen_blank_ok()
    return redirect(url_for('project_view.project_view_id', id = id))
    """




