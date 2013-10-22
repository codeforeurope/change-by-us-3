# -*- coding: utf-8 -*-

from functools import wraps
from ..project.decorators import _is_owner, _is_organizer, _is_member

from ..helpers.flasktools import *
from flask import g, request, current_app

def post_delete_permission(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        # TODO see if user is site admin

        post_id = request.form.get('post_id') or request.view_args.get('post_id')

        errStr = ''
        if post_id is None:
            errStr = "post_id can not be blank."
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))
   
        try:
            post = ProjectPost.objects.with_id(post_id)
            project = Project.objects.with_id(post.project)

            if post is None:
                errStr = "post {0} does not exist.".format(project_id)
                return jsonify_response( ReturnStructure( success = False,
                                                          msg = errStr ))
        
        except Exception as e:
            infoStr = "Exception looking up post of id {0}".format(project_id)
            current_app.logger.info(infoStr)
            errStr = "post {0} does not exist.".format(project_id)
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))


        # delete own post if still member
        if post.user.id == g.user.id and _is_member(project, g.user.id):
            return f(*args, **kwargs)
        
        # delete if organizer
        if _is_organizer(project, g.user.id):
            return f(*args, **kwargs)

        errStr = "User does not have permission to delete post."
        return jsonify_response( ReturnStructure( success = False,
                                                   msg = errStr ))

    return decorated_function



def post_edit_permission(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        # TODO see if user is site admin

        post_id = request.form.get('post_id') or request.view_args.get('post_id')

        errStr = ''
        if post_id is None:
            errStr = "post_id can not be blank."
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))
   
        try:
            post = ProjectPost.objects.with_id(post_id)
            project = Project.objects.with_id(post.project)

            if post is None:
                errStr = "post {0} does not exist.".format(project_id)
                return jsonify_response( ReturnStructure( success = False,
                                                          msg = errStr ))
        
        except Exception as e:
            infoStr = "Exception looking up post of id {0}".format(project_id)
            current_app.logger.info(infoStr)
            errStr = "post {0} does not exist.".format(project_id)
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))


        # edit own post if still member
        if post.user.id == g.user.id and _is_member(project, g.user.id):
            return f(*args, **kwargs)
        
        # edit if project owner
        if _is_owner(project, g.user.id):
            return f(*args, **kwargs)

        errStr = "User does not have permission to edit post."
        return jsonify_response( ReturnStructure( success = False,
                                                  msg = errStr ))

    return decorated_function


def post_exists(f):
   @wraps(f)
   def decorated_function(*args, **kwargs):
        project_id = request.form.get('post_id') or request.view_args.get('post_id')

        errStr = ''
        if post_id is None:
            errStr = "post_id can not be blank."
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))
   
        try:
            post = ProjectPost.objects.with_id(post_id)
            if project is None:
                errStr = "post {0} does not exist.".format(project_id)
                return jsonify_response( ReturnStructure( success = False,
                                                          msg = errStr ))
        
        except Exception as e:
            infoStr = "Exception looking up post of id {0}".format(project_id)
            current_app.logger.info(infoStr)
            errStr = "post {0} does not exist.".format(project_id)
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))


        return f(*args, **kwargs)

   return decorated_function



