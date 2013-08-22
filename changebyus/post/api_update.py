# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from flask import Blueprint, request, render_template, redirect
from flask import url_for, g, current_app

from flask.ext.login import login_required, current_user

from .models import ProjectPost, Project, User, SocialMediaObject
from .decorators import post_delete_permission, post_edit_permission, post_exists 
from .api import CreateProjectPostForm
from .helpers import _create_project_post

from ..project.decorators import project_exists, project_member
from ..helpers.flasktools import ReturnStructure, jsonify_response
from ..helpers.mongotools import db_list_to_dict_list


post_update_api = Blueprint('post_update_api', __name__, url_prefix='/api/post')

@post_update_api.route('/project/<project_id>/list_updates')
@project_exists
def api_get_project_updates_fixed(project_id):
    """
    ABOUT
        Given a project id, return a fixed number of updates for that project.
    METHOD
        Get
    INPUT
        project_id
    OUTPUT
        List of posts and all responses to that post
    PRECONDITIONS
        User is logged in, user a member of the project
    """

    posts = ProjectPost.objects( parent_id = None, 
                                 project = project_id,
                                 public = True )[0:10]

    return jsonify_response( ReturnStructure( data = db_list_to_dict_list(posts) ) )



@post_update_api.route('/project/<project_id>/list_updates/<number_posts>')
@project_exists
def api_get_project_updates(project_id, number_posts):
    """
    ABOUT
        Given a project id, return the updates for that project.
    METHOD
        Get
    INPUT
        project_id, number_posts
    OUTPUT
        List of posts and all responses to that post
    PRECONDITIONS
        User is logged in, user project member
    TODO
        Add filtering for the user, ie max number of posts, search by string, etc
    """

    posts = Projects.objects( parent_id = None, 
                              project = project_id,
                              public = True )[0:number_posts]

    return jsonify_response( ReturnStructure( data = db_list_to_dict_list(posts) ) )



@post_update_api.route('/add_update', methods = ['POST'])
@login_required
@project_exists
@project_member
def api_add_project_update():
    """
    ABOUT
        Method to add a discussion to a give project
    METHOD
        Post
    INPUT
        title - REQUIRED, 
        description - REQUIRED, 
        project_id - REQUIRED,
        response_to_id - original post ID
    OUTPUT
        Results
    PRECONDITIONS
        User is logged in, user is a member or owner of the project.

        ONLY organizers can create updates. Members can only respond
    """

    form = CreateProjectPostForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    title = request.form.get('title')
    description = request.form.get('description')
    project_id = request.form.get('project_id')
    response_to_id = request.form.get('response_to_id')

    return _create_project_post(title = title,
                                description = description,
                                project_id = project_id,
                                response_to_id = response_to_id,
                                visibility = 'public')


@post_update_api.route('/edit_update', methods = ['POST'])
@login_required
@post_exists
@post_edit_permission
def api_edit_project_update():
    """
    ABOUT
        Allow for the editing of an existing post
    METHOD
        Post
    INPUT
        post_id, title, description
    OUTPUT
        Json structure representing the modified post
    PRECONDITIONS
        User is logged in, user is the owner of the post or owner of the group
    TODO
        Allow updating of related events, images, and most importantly update
        social posts.
    """

    form = EditProjectPostForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )


    post_id = request.form.get('post_id')
    description = request.form.get('description')
    title = request.form.get('title')

    post = ProjectPost.objects.with_id(post_id)

    if description: post.description = description
    if title: post.title = title

    post.save()

    infoStr = "Update {0} edited by {1}.".format(id, g.user.id)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( data = post.as_dict() ) )


@post_update_api.route('/delete_update', methods = ['POSTS'])
@login_required
@post_exists
@post_delete_permission
def api_delete_project_update():

    form = DeleteProjectPostForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    post_id = requests.form.get('post_id')

    post = ProjectPosts.objects.with_id( post_id )
    post.delete()

    infoStr = "User {0} deleted Update {1}".format(g.user.id, post_id)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( ) )

