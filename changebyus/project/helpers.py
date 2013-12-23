# -*- coding: utf-8 -*-


from flask import g, current_app, request, abort

from ..user.models import User
from ..helpers.mongotools import db_list_to_dict_list
from ..helpers.flasktools import jsonify_response, ReturnStructure
from ..helpers.imagetools import generate_thumbnail, upload_image
from ..helpers.stringtools import slugify

from .models import Project, UserProjectLink, Roles, ACTIVE_ROLES, ProjectCategory
 
from ..wordlist import filter_model

import requests
import simplejson as json
import os

## DEPRECATED
def _get_lat_lon_from_location(loc):
    """
    Returns lat/lon pair as a list from google maps api.
    Theoretically any valid location string would work, but
    we're expecting zipcode here.
    """
    r = requests.get("http://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=false" % loc)
    latlon = []
    
    if (r.status_code == 200):
        d = json.loads(r.text)
        
        try:
            lld = d['results'][0]['geometry']['location']
            latlon = [lld['lat'], lld['lng']]
        except:
            latlon = []

    return latlon

def _create_project(form):

    name = form.name.data
    description = form.description.data
    category = form.category.data
    website = form.website.data
    gcal_code = form.gcal_code.data
    location = form.location.data
    lat = form.lat.data
    lon = form.lon.data
    resource = form.resource.data
    
    if (lat and lon):
        geo_location = [float(lon), float(lat)]
    else:
        geo_location = None

    owner = User.objects.with_id(g.user.id)
    slug = slugify(name)

    project = Project.objects(name = name,
                              slug = slug )

    if project.count() > 0:
        errStr = "Sorry, the name '{0}' is already in use.".format(name)
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    p = Project( name = name, 
                 description = description, 
                 category = category,
                 website = website,
                 gcal_code = gcal_code,
                 location = location,
                 geo_location = geo_location,
                 owner = owner,
                 resource = resource,
                 slug = slug )

    filter_model(p, ['name', 'description'])

    try:
        p.save()
    except Exception as e:
        infoStr = "Hit race condition saving project with name {0}".format(name)
        current_app.logger.info(infoStr)
        current_app.logger.exception(e)

        errStr = "Sorry, the name '{0}' is already in use.".format(name)
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )        

    file_name = None

    # photo is optional
    if 'photo' in request.files:
        photo = request.files.get('photo')

        from .models import project_images

        file_name = upload_image(photo, project_images)

    # we don't store the URL because the URL can change depending on what
    # rackspace container we wish to use
    if file_name:
        p.image_name = file_name


    p.save()
    infoStr = "User {0} has created project called {1}".format(g.user.id, name)
    current_app.logger.info(infoStr)

    from ..post.activity import update_project_activity
    update_project_activity( p.id )

    return jsonify_response( ReturnStructure( data = p.as_dict() ))


def _edit_project(form):
    
    project_id = form.project_id.data
    name = form.name.data
    description = form.description.data
    category = form.category.data
    website = form.website.data
    gcal_code = form.gcal_code.data
    location = form.location.data
    lat = form.lat.data
    lon = form.lon.data

    p = Project.objects.with_id(project_id)

    if name:
        name_text = Project.objects(name = name)
        if name_text.count() > 0 and name_text[0] != p:
            msg = "Project name {0} is already in use.".format(name)
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = msg ))

    if name: p.name = name
    if description: p.description = description
    if category: p.category = category
    if website: p.website = website
    if gcal_code: p.gcal_code = gcal_code
    
    if (lat and lon):
        p.geo_location = [float(lon), float(lat)]
    

    # TODO flag objects if new content needs to be flagged,
    # BUT don't double-flag existing, unchanged content

    # handle image manipulation stuff

    file_name = None

    # photo is optional
    if 'photo' in request.files:
        photo = request.files.get('photo')

        from .models import project_images
        file_name = upload_image(photo, project_images)


    # we don't store the URL because the URL can change depending on what
    # rackspace container we wish to use
    if file_name:
        p.image_name = file_name
        

    p.save()

    infoStr = "User {0} has edited project {1} with request {2}".format(g.user.id,
                                                                        project_id,
                                                                        str(request.json))
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( data = p.as_dict() ))


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
    if project == None:
        return False

    if project.owner.id == user_id:
        return True

    upl = UserProjectLink.objects(user = user_id,
                                  project = project_id)

    if upl.count() == 0:
        return False

    if upl[0].role in ACTIVE_ROLES:
        return True

    warnStr = "User {0} has role in project {1} but it's of unknown type {2}".format(user_id,
                                                                                     project_id,
                                                                                     upl[0].role)
    current_app.logger.warn(warnStr)
    return False


def _get_project_name( project_id = None ):
    project = Project.objects.with_id(project_id)

    return project.name

def _get_users_for_project( project_id = None ):
    """
    ABOUT
        Get a list of users in a given project, including owner
    METHOD
        Native Python
    INPUT
        project_id
    OUTPUT
        List of dictionaries of user representations
    """

    project = Project.objects.with_id(project_id)
    if project == None:
        return []

    users = []
    users.append( project.owner )

    upls = UserProjectLink.objects(project = project_id)
    for upl in upls:
        if upl.role in ACTIVE_ROLES:
            users.append( upl.user )

    return db_list_to_dict_list(users)

def _get_user_roles_for_project(project, user_id):
    project_id = project.id if isinstance(project, Project) else project
    upl = UserProjectLink.objects( user = user_id,
                                   project = project_id )
    return upl


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
                                    role__in = ACTIVE_ROLES)

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

        try:
            user_dict = user.as_dict()
            user_dict['common_projects'] = projects
            return_list.append(user_dict)
        except AttributeError:
            print "Oops!  not valid"


    return return_list



def _get_user_owned_projects(user_id):
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
    projects = Project.objects( owner = user_id )

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


def _get_user_joined_projects(user_id):
    """
    ABOUT
        Get a list of projects a user is member of
    METHOD
        Native Python
    INPUT
        user_id
    OUTPUT
        list of dictionary objects representing projects
    """

    projectLinks = UserProjectLink.objects( user = user_id,
                                            role__in = ACTIVE_ROLES )
    projects = []
    for pl in projectLinks:
        projects.append(pl.project)

    return db_list_to_dict_list(projects)



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
                                                          role__in = ACTIVE_ROLES )

    projects = set(ownedProjects)
    for link in joinedLinks:
        projects.add(link.project)

    return db_list_to_dict_list(projects)


def _get_project_organizers(project_id):
    return _get_users_for_role(project_id, Roles.ORGANIZER)

def _get_project_members(project_id):
    return _get_users_for_role(project_id, Roles.MEMBER)

def _get_users_for_role(project_id, role):

    project = Project.objects.with_id( project_id )
    if project is None:
        return []

    users = []
    links = UserProjectLink.objects( project = project )
    for link in links:
        if link.role == role:
            users.append( link.user )

    return db_list_to_dict_list( users )



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


def _leave_project(project_id=None, user_id=None):


    project = Project.objects.with_id(project_id)

    if project.owner.id == user_id:
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = 'Project owner can not leave the project.' ) )
    
    links = UserProjectLink.objects( user = user_id,
                                    project = project_id)


    if links.count() == 0:
        return jsonify_response( ReturnStructure( success = True,
                                                  msg = 'User was not involved in project.' ) )
    if links.count() > 1:
        warnStr = "Warning, user {0} has multiple user_project_links on project {1}".format(user_id,
                                                                                            project_id)
        current_app.logger.warn(warnStr)

    for link in links:
        link.delete()

    from ..post.activity import update_project_activity
    update_project_activity( project_id )

    return jsonify_response( ReturnStructure( ) )


def _create_category(cat):
    c = ProjectCategory(name=cat)
    c.save()
    
    
def _remove_category(cat):
    pass
