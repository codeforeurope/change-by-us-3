# -*- coding: utf-8 -*-

from functools import wraps
from .models import Project, Roles, UserProjectLink, ACTIVE_ROLES
from ..helpers.flasktools import *

from flask import g, request, current_app

# TODO add site owner

def _is_owner(project, user_id):
    if not isinstance(project, Project):
        project = Project.objects.with_id(project)

    return project.owner.id == user_id

def _is_member(project, user_id):
    if _is_owner(project, user_id): 
        return True

    return _check_for_roles(project, user_id, ACTIVE_ROLES)

def _is_organizer(project, user_id):
    if _is_owner(project, user_id):
        return True
    
    return _check_for_roles(project, user_id, [Roles.ORGANIZER])

def _check_for_roles(project, user_id, roles_list):

    project_id = project.id if isinstance(project, Project) else project
    upl = UserProjectLink.objects( user = user_id,
                                   project = project_id )

    print "links: ", upl.count()

    if upl.count() == 0:
        return False

    print "upl ", upl[0].role

    if upl[0].role in roles_list:
        return True

    return False

    
def project_exists(f):
   @wraps(f)
   def decorated_function(*args, **kwargs):
        project_id = request.form.get('project_id') or request.view_args.get('project_id')

        errStr = ''
        if project_id is None:
            errStr = "project_id can not be blank."
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))
   
        try:
            project = Project.objects.with_id(project_id)
            if project is None:
                errStr = "project {0} does not exist.".format(project_id)
                return jsonify_response( ReturnStructure( success = False,
                                                          msg = errStr ))
        
        except Exception as e:
            infoStr = "Exception looking up project of id {0}".format(project_id)
            current_app.logger.info(infoStr)
            errStr = "Project {0} does not exist.".format(project_id)
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))


        return f(*args, **kwargs)

   return decorated_function


def project_member(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        project_id = request.form.get('project_id') or request.view_args.get('project_id')

        if _is_member(project_id, g.user.id):
            return f(*args, **kwargs)

        errStr = "User is not a member of project {0}".format(project_id)
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))
    return decorated_function


def project_ownership(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        project_id = request.form.get('project_id') or request.view_args.get('project_id')

        project = Project.objects.with_id(project_id)
        if _is_owner(project, g.user.id):
            return f(*args, **kwargs)

        errStr = "User is not owner of project {0}".format(project_id)
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))

    return decorated_function

# assumes user is logged in
def project_organizer(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        project_id = request.form.get('project_id') or request.view_args.get('project_id')

        project = Project.objects.with_id(project_id)

        if _is_organizer(project, g.user.id):
            return f(*args, **kwargs)

        errStr = "User is not an organizer of project {0}".format(project_id)
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))

    return decorated_function






