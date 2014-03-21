# -*- coding: utf-8 -*-

from changebyus.helpers.flasktools import *
from flask import g, request, current_app, abort
from functools import wraps
from .helpers import _get_user_roles_for_project
from .models import Project, Roles, UserProjectLink, ACTIVE_ROLES
from mongoengine.errors import ValidationError


def _is_owner(project, user_id):
    if not isinstance(project, Project):
        project = Project.objects.with_id(project)
 
    return (str(project.owner.id) == str(user_id))

def _is_member(project, user_id):
    if _is_owner(project, user_id): 
        return True

    return _check_for_roles(project, user_id, ACTIVE_ROLES)
    
def _is_private_member(project, user):
    return (not project.private or 
           (not user.is_anonymous() and _is_member(project, user.id)))    

def _is_organizer(project, user_id):
    if _is_owner(project, user_id):
        return True
    
    return _check_for_roles(project, user_id, [Roles.ORGANIZER])

def _check_for_roles(project, user_id, roles_list):
    upl = _get_user_roles_for_project(project, user_id)

    if upl.count() == 0:
        return False

    if upl[0].role in roles_list:
        return True

    return False

    
def project_exists(f):
   @wraps(f)
   def decorated_function(*args, **kwargs):
        if(request.json):
            project_id = request.json.get('project_id')
        else:
            project_id = request.form.get('project_id') or request.view_args.get('project_id')

        if project_id is None:
            abort(400)

        try:
            project = Project.objects(id=project_id, active=True)
            # count forces execution of query
            project.count()

        except ValidationError as e:
            try:
                project = Project.objects(slug=project_id, active=True)
                # count forces execution of query
                project.count()

            except ValidationError as e:
                project = None

        if project is None or project.count() == 0:
            abort(404)

        return f(*args, **kwargs)

   return decorated_function


def project_member(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if(request.json):
            project_id = request.json.get('project_id')
        else:
            project_id = request.form.get('project_id') or request.view_args.get('project_id')

        if _is_member(project_id, g.user.id):
            return f(*args, **kwargs)

        errStr = "User is not a member of project {0}".format(project_id)
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))
    return decorated_function


def valid_project_membership(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if(request.json):
            project_id = request.json.get('project_id')
        else:
            project_id = request.form.get('project_id') or request.view_args.get('project_id')

        if _is_private_member(Project.with_id_or_slug(project_id), g.user):
            return f(*args, **kwargs)
        else:
            abort(404)
    
    return decorated_function


def project_ownership(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if(request.json):
            project_id = request.json.get('project_id')
        else:
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
        if(request.json):
            project_id = request.json.get('project_id')
        else:
            project_id = request.form.get('project_id') or request.view_args.get('project_id')

        project = Project.objects.with_id(project_id)

        if _is_organizer(project, g.user.id):
            return f(*args, **kwargs)

        errStr = "User is not an organizer of project {0}".format(project_id)
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))

    return decorated_function






