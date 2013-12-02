# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from flask import Blueprint, request, render_template, redirect
from flask import url_for, g, current_app

from flask.ext.login import login_required, current_user

from .models import ProjectPost, Project, User, SocialMediaObject
from .api import CreateProjectPostForm
from .helpers import _create_project_post

from .decorators import post_delete_permission, post_edit_permission, post_exists 

from ..project.decorators import project_exists, project_member
from ..helpers.flasktools import ReturnStructure, jsonify_response
from ..helpers.mongotools import db_list_to_dict_list

post_discussion_api = Blueprint('post_discussion_api', __name__, url_prefix='/api/post')

#######
# @post_discussion_api.route('/project/<project_id>/post/<post_type>')
# @post_discussion_api.route('/project/<project_id>/post/<post_type>/<number_posts>')
# @login_required
# @project_exists
# @project_member
# def api_get_project_discussions_fixed(project_id, post_type, number_posts=10):
#     public = (post_type == 'update')
######
    
@post_discussion_api.route('/project/<project_id>/list_discussions')
@login_required
@project_exists
@project_member
def api_get_project_discussions_fixed(project_id):
    """
    ABOUT
        Given a project id, return a fixed number of discussions for that project.
    METHOD
        Get
    INPUT
        project_id
    OUTPUT
        List of posts and all responses to that post
    PRECONDITIONS
        User is logged in, user a member of the project
    """

    sort = request.args.get('sort')
    order = request.args.get('order', 'asc')
 
    if (sort):
        sort_order = "%s%s" % (("-" if order == 'desc' else ""), sort) 
        posts = ProjectPost.objects( parent_id = None, 
                                 project = project_id,
                                 public = False ).order_by(sort_order)[0:10]
    else:
        posts = ProjectPost.objects( parent_id = None, 
                                 project = project_id,
                                 public = False )[0:10]

    return jsonify_response( ReturnStructure( data = db_list_to_dict_list(posts) ) )



@post_discussion_api.route('/project/<project_id>/list_discussions/<number_posts>')
@login_required
@project_exists
@project_member
def api_get_project_discussions(project_id, number_posts):
    """
    ABOUT
        Given a project id, return the discussions for that project.
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
                              public = False )[0:number_posts]

    return jsonify_response( ReturnStructure( data = db_list_to_dict_list(posts) ) )



@post_discussion_api.route('/add_discussion', methods = ['POST'])
@login_required
@project_exists
@project_member
def api_add_project_discussion():
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
        User is logged in, user is a member or owner of the project
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
                                visibility = 'private')


@post_discussion_api.route('/edit_discussion', methods = ['POST'])
@login_required
@post_exists
@post_edit_permission
def api_edit_project_discussion():
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

    infoStr = "Discussion {0} edited by {1}.".format(id, g.user.id)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( data = post.as_dict() ) )


@post_discussion_api.route('/delete_discussion', methods = ['POST'])
@login_required
@post_exists
@post_delete_permission
def api_delete_project_discussion():

    form = DeleteProjectPostForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    post_id = requests.form.get('post_id')

    post = ProjectPosts.objects.with_id( post_id )
    post.delete()

    infoStr = "User {0} deleted Discussion {1}".format(g.user.id, post_id)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( ) )

