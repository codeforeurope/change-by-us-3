# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for, request, current_app, g, abort
from flask.ext.login import login_required, current_user, login_user

from ..helpers import gen_ok, gen_blank_ok, db_list_to_dict_list, generate_thumbnails

from .models import Project, UserProjectLink

from ..stripe.models import StripeAccount
from ..stripe.api import _get_account_balance_percentage

from ..user.models import User

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
    name = request.form['name']
    description = request.form['description']
    municipality = request.form['location']
    owner = User.objects.with_id(g.user.id)

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
        return render_template('error.html', error="Sorry, the name '{0}'' is already used.".format(name))

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

    #return gen_ok( jsonify( p.as_dict()))
    return redirect(url_for('project_view.project_view_id', id = p.id))


@project_api.route('/<id>')
def api_get_project(id):
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
    p = Project.objects.with_id(id)

    if p.count() > 0:
        return gen_ok( jsonify( p.as_dict()))
    else:
        return not_found()

@project_api.route('/<id>/edit', methods = ['POST'])
@login_required
def api_edit_project(id):
    """
    ABOUT
        Edit an existing project
    METHOD
        Post
    INPUT
        project id (via url), name, description, location
    OUTPUT
        Json representation of the modified project.
    PRECONDITIONS
        User is logged in and owns the project
    TODO
        Test to be sure the type of object comparison we use functions, test in general
    """
    p = Project.objects.with_id(id)

    if p.count() == 0:
        return not_found()

    name = request.form['name']
    description = request.form['description']
    municipality = request.form['location']
    owner = User.objects.with_id(g.user.id)

    # TODO be sure this object comparison works
    if owner != p.owner:
        return no_permission("You are not the project owner")

    if name: p.name = name
    if description: p.description = description
    if municipality: p.municipality = municipality

    p.save()
    infoStr = "User {0} has edited project {1} with request {2}".format(g.user.id,
                                                                        id,
                                                                        str(request.form))
    current_app.logger.info(infoStr)

    return gen_ok( jsonify( p.as_dict()))



@project_api.route('/<id>/users')
# return a list of users given a project
@login_required
def api_view_project_users(pid):
    """
    ABOUT
        Get a list of users who belong to a given project
    METHOD
        Get
    INPUT
        project id
    OUTPUT
        Json list of user objects
    PRECONDITIONS
        User is logged in
    """
    users = _get_users_for_project(pid)

    return users

@project_api.route('/user/<id>/ownedprojects')
@login_required
def api_edit_user(id):
    """
    ABOUT
        Get a list of projects owned by a given user
    METHOD
        Get
    INPUT
        User id
    OUTPUT
        Json list of project objects
    PRECONDITIONS
        User is logged in
    """
    pList = _get_user_owned_projects(id)

    return gen_ok( jsonify(projects=pList))


@project_api.route('/user/<id>/joinedprojects')
@login_required
# TODO should we restrict this further than login required?
def api_edit_user(id):
    """
    ABOUT
        Get a list of projects a user has joined
    METHOD
        Get
    INPUT
        User id
    OUTPUT
        Json list of project objects
    PRECONDITIONS
        User is logged in
    """

    pList = _get_user_joined_projects(id)

    return gen_ok( jsonify(projects=pList))


@project_api.route('/<id>/users_and_common_projects')
# return a list of users given a project and projects in common
@login_required
def api_view_project_users_common_projects(pid):
    """
    ABOUT
        Get a list of users in a project and the projects they have in common
        with the currently logged in user
        list of [user, projects]
    METHOD
        Get
    INPUT
        project id
    OUTPUT
        Json list of users and their common projects
    PRECONDITIONS
        User is logged in
    """
    return_list = _get_project_users_and_common_projects(project_id=pid, 
                                                         user_id=g.user.id)

    return gen_ok( jsonify(users = return_list) )


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


@project_api.route('/<id>/join', methods = ['POST'])
# TODO add membership required decorator
@login_required
def api_join_project(id):
    """
    ABOUT
        Allows a user to join a project
    METHOD
        Post
    INPUT
        project id (via url)
    OUTPUT
        Currently a rendered tempalte for the project.  Should in the future return a Jsonified OK statement.
    PRECONDITIONS
        User is logged in
    TODO
        Convert to a pure API routine where we only join the user and return a status code
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



# True is user is owner or member of project
def _user_involved_in_project( project_id = None, 
                               user_id = None):
    """
    ABOUT
        Check whether or not a user is involved in a project, meaning a project 
        member or a project owner
    METHOD
        Native Python
    INPUT
        project_id, user_id 
    OUTPUT
        True or False
    """
    
    project = Project.objects.with_id(project_id)
    user = User.objects.with_id(user_id)

    if project.owner == user:
        return True

    # only look for links that the user_left is False, ie the user is still joined
    project_link = UserProjectLink.objects( user = user,
                                            project = project,
                                            user_left = False)

    if project_link.count() > 0:
        if project_link.count() > 1:
            errStr = "User {0} has multiple project links on project {1}".format(user_id, project_id)
            current_app.logger.error(errStr)

        # user_left = False means they are in the project
        return True

    return False


def _get_users_for_project( pid ):
    """
    ABOUT
        Get a list of users in a given project, including owner
    METHOD
        Native Python
    INPUT
        project id
    OUTPUT
        List of dictionaries of user representations
    """

    users = []
    # ensure_index
    user_links = UserProjectLink.objects( project=pid,
                                          user_left=False )
    for link in user_links:
        users.append( link.user.as_dict() )

    project = Project.objects.with_id(pid)
    if project is not None:
        users.append( project.owner )

    return users


def _get_project_users_and_common_projects(project_id = None, user_id = None):
    """
    ABOUT
        Gets a list of users and their in-common projects
        Either based on a specific project (project_id = 123) 
        or based on all the given users projects (project_id = None)
    METHOD
        Native Python
    INPUT
        valid user_id, optional project_id
    OUTPUT
        List of dictionary objects that represent users and the projects 
        that user has in common with you
    """
    # if no project_id provided, just work on the user projects
    if project_id is None or project_id == '':
        projects = _get_user_involved_projects(user_id)

        project_id_list = []
        for project in projects:
            project_id_list.append(project['id'])

    else:
        # or work on a list of specific projects, or project
        project_id_list = [project_id]


    # now for each project get the users who are joined
    links = UserProjectLink.objects(project__in = project_id_list,
                                    user_left = False)

    user_projects = Project.objects(id__in = project_id_list)

    # this will give us a dictionary of common users and for each
    # common user a list of projects we have in common with them    
    common_users = {}
    for link in links:
        if common_users.has_key( link.user ):
            common_users[ link.user ].append( link.project.as_dict() )
        else:
            common_users[ link.user ] = [link.project.as_dict()]


    # now add in project owners from above, since project_link doesn't exist
    # for project owners
    for project in user_projects:

        # we already got the project user owns from _get_user_involved_projects
        if project.owner == g.user.id:
            continue

        if common_users.has_key( project.owner ):
            common_users[ project.owner ].append( project.as_dict() )
        else:
            common_users[ project.owner ] = [project.as_dict()]


    # convert to the output we want        
    return_list = []
    for user, projects in common_users.iteritems():
        # skip ourselves
        if user == g.user.id:
            continue

        user_dict = user.as_dict()
        user_dict['common_projects'] = projects

        return_list.append(user_dict)

    return return_list




def _get_user_owned_projects(id):
    """
    ABOUT
        Get a list of projects a given user owns
    METHOD
        Native Python
    INPUT
        user id
    OUTPUT
        list of dictionary objects representing projects
    """
    u = User.objects.with_id(id)
    projects = Project.objects( owner = u )

    return db_list_to_dict_list(projects)


def _check_user_owns_project(user_id=None, project_id=None):
    """
    ABOUT
        Checks if a given user owns the project
    METHOD
        Native Python
    INPUT
        user_id, project_id
    OUTPUT
        True, False
    """
    project = Project.objects.with_id(project_id)
    if project is None:
        return False

    return project.owner.id == user_id


def _get_user_joined_projects(id):
    """
    ABOUT
        Get a list of projects a user is member of
    METHOD
        Native Python
    INPUT
        user id
    OUTPUT
        list of dictionary objects representing projects
    """
    u = User.objects.with_id(id)
    projectLinks = UserProjectLink.objects( user = u,
                                            user_left = False )

    return db_list_to_dict_list(projectLinks)



# returns a list of projects user owns or is joined to
def _get_user_involved_projects(id):
    """
    ABOUT
        Get a list of projects a user is a member of or an owner of
    METHOD
        Native Python
    INPUT
        user id
    OUTPUT
        list of dictionary objects representing projects
    """
    u = User.objects.with_id(id)

    ownedProjects = Project.objects( owner = u )
    joinedLinks = projectLinks = UserProjectLink.objects( user = u,
                                                          user_left = False )

    projects = set(ownedProjects)
    for link in joinedLinks:
        projects.add(link.project)

    return db_list_to_dict_list(projects)



def _link_stripe_to_project(project_id=None,
                            stripe_account_id=None):
    
    """
    ABOUT
        Links a stripe account (identified by supplied id) to a given project
    METHOD
        Native Python
    INPUT
        project_id, stripe_account_id
    OUTPUT
        True, False
    PRECONDITIONS
        Stripe account should be in the database
    """
    project = Project.objects.with_id(project_id)
    stripe_account = StripeAccount.objects.with_id(stripe_account_id)

    if stripe_account is None:
        warnStr = "Tried to link non existent stripe account {0} to project {1}".format(stripe_account_id, 
                                                                                        project_id)
        current_app.console.warn(warnStr)
        return False

    if project.stripe_account is not None:
        warnStr = "Tried to link stripe account {0} to project {1} but project has stripe account {2} already".format(stripe_account_id,
                                                                                                                      project_id,
                                                                                                                      project.stripe_account.stripe_user_id)
        current_app.console.warn(warnStr)
        return False


    project.stripe_account = stripe_account
    project.save()

    infoStr = "Stripe account {0} has been linked to project {1}".format(stripe_account_id, project_id)
    current_app.logger.info(infoStr)

    return True



def _get_stripe_account_balance_percentage(project_id=None):
    """
    ABOUT
        Returns the balance of a stripe account linked to a project
    METHOD
        Native Python
    INPUT
        project_id
    OUTPUT
        0 if no record, or balance of account
    """
    project = Project.objects.with_id(project_id)
    if project is None or project.stripe_account is None:
        return 0

    return _get_account_balance_percentage(project.stripe_account)


def _unlink_stripe_account(project_id=None):
    """
    ABOUT
        Unlinks a stripe account from a project, putting the stripe account
        in a list of retired stripe accounts for the project.  This is for 
        historical book keeping records
    METHOD
        Native Python
    INPUT
        project_id
    OUTPUT
        True, False
    TODO
        Currently we only set the stripe_account to None, which may not
        correctly delete the field from the database entry.
    """
    project = Project.objects.with_id(project_id)
    if project == None:
        errStr = "Requested unlink of stripe from non existant project {0}".format(project_id)
        current_app.logger.error(errStr)

        return False

    if project.stripe_account == None:
        errStr = "Requested unlink of stripe from non project {0} that has no stripe".format(project_id)
        current_app.logger.error(errStr)

        return False


    project.retired_stripe_accounts.append(project.stripe_account)
    # TODO figure out how to delete this
    #project.stripe_account.delete()
    project.stripe_account = None

    infoStr = "Unlinking stripe account {0} from project {1}".format(project.stripe_account,
                                                                     project.id)
    current_app.logger.info(infoStr)

    project.save()

    return True



def _check_stripe_account_link(stripe_user_id=None):
    """
    ABOUT
        Check to see if a stripe account is linked to any project
    METHOD
        Native Python
    INPUT
        stripe_user_id
    OUTPUT
        False,'' OR True,'project name'
    """
    stripe = StripeAccount.objects(stripe_user_id = stripe_user_id)
    if stripe.count() is 0:
        return False, ""

    if stripe.count() > 1:
        errStr = "Multiple stripe accounts for stripe_user_id {0}".format(stripe_user_id)
        current_app.logger.error(errStr)

    project = Project.objects(stripe_account = stripe.first())
    if project.count() is 0:
        return False, ""

    return True, project.first().name


