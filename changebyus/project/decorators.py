# -*- coding: utf-8 -*-

from functools import wraps
from .models import *
from ..helpers.flasktools import *
from flask import g, request

def _is_owner(project, user):
    return project.owner == user

def _is_member(project, user):
    if _is_owner(project, user): 
        return True
    return _check_for_roles(project, user, [Roles.MEMBER, Roles.ORGANIZER])

def _is_organizer(project, user):
    if _is_owner(project, user):
        return True
    return _check_for_roles(project, user, [Roles.ORGANIZER])

def _check_for_role(project, user, roles_list):
    roles = project.user_roles
    if not roles.has_key(user):
        return False

    role = roles[user]
    if role.name in roles_list:
        return True

    return False

    

def project_exists(f, project_id):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        
        errStr = ''
        if project_id is None:
            errStr = "project_id can not be blank."
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))
    
        project = Project.objects.with_id(project_id)
        if project is None:
            errStr = "project {0} does not exist.".format(project_id)
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))

        return f(*args, **kwargs)

    return decorated_function



@project_exists
def group_membership_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        project_id = get_form('project_id')
        if _is_member(project, g.user):
            return f(*args, **kwargs)

        errStr = "User is not a member of project {0}".format(project_id)
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))
    return decorated_function

@project_exists
def project_ownership(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        project_id = get_form('project_id')
        if _is_owner(project, g.user):
            return f(*args, **kwargs)

        errStr = "User is not owner of project {0}".format(project_id)
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))

    return decorated_function

# assumes user is logged in
@project_exists
def project_organizer(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        project_id = get_form('project_id')
        if _is_organizer(project, g.user):
            return f(*args, **kwargs)

        errStr = "User is not an organizer of project {0}".format(project_id)
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))

    return decorated_function






