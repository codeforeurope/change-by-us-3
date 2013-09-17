# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, request, render_template, redirect
from flask import url_for, g, current_app

from flask.ext.login import login_required, current_user

from flask.ext.wtf import (Form, TextField, TextAreaField, FileField, 
                           SubmitField, Required, ValidationError, FieldList)

from .models import ProjectPost, Project, User, SocialMediaObject
from .decorators import post_delete_permission, post_edit_permission, post_exists 

from ..facebook.facebook import _post_user_facebook_feed
from ..twitter.twitter import _post_user_twitter_update
from ..bitly.api import _get_bitly_url

from ..helpers.mongotools import db_list_to_dict_list

from ..stream.api import _get_user_stream

from ..project.helpers import ( _get_user_involved_projects, _get_project_users_and_common_projects,
                                _user_involved_in_project )

from ..project.decorators import ( project_exists, project_member, 
                                   _is_organizer as _is_project_organizer )

from ..helpers.flasktools import jsonify_response, ReturnStructure


from ..stripe.api import _get_account_balance_percentage
from ..twitter.twitter import _get_user_name_and_thumbnail
from ..facebook.facebook import _get_fb_user_name_and_thumbnail

from .helpers import _get_posts_for_project

post_api = Blueprint('post_api', __name__, url_prefix='/api/post')


"""
=========
Post Api
=========

Posts exist on a per-project basis, with multiple posts per project possible.
Posts can be public or private, and can have a link to social platforms, ie
a twitter_post_id and a facebook_post_id, however the actual social posting
is handled by other modules
"""


@post_api.route('/project/<project_id>/listposts')
@project_exists
def api_get_project_posts_fixed(project_id):
    """
    ABOUT
        Given a project id, return a fixed number of posts for that project that 
        are visible to the user.  Visibility depends on membership
    METHOD
        Get
    INPUT
        project_id
    OUTPUT
        List of posts and all responses to that post
    PRECONDITIONS
        User is logged in
    TODO
        Add filtering for the user, ie max number of posts, search by string, etc
    """

    # 10 posts
    if g.user.is_anonymous():
        private_posts = False
    else:
        private_posts = _is_project_organizer( project_id, g.user.id )

    posts = _get_posts_for_project( project_id = project_id,
                                    private_posts = private_posts,
                                    max_posts = 10 )

    ret_posts = db_list_to_dict_list( posts )

    return jsonify_response( ReturnStructure( data = ret_posts ) )



@post_api.route('/project/<project_id>/listposts/<number_posts>')
@project_exists
def api_get_project_posts(project_id, number_posts):
    """
    ABOUT
        Given a project id, return the posts for that project that are visible to the user.
        Visibility depends on membership
    METHOD
        Get
    INPUT
        project_id, number_posts
    OUTPUT
        List of posts and all responses to that post
    PRECONDITIONS
        User is logged in
    TODO
        Add filtering for the user, ie max number of posts, search by string, etc
    """
    

    if g.user.is_anonymous() :
        private_posts = False
    else:
        private_posts = _is_project_organizer( project_id, g.user.id )

    posts = _get_posts_for_project( project_id = project_id,
                                    private_posts = private_posts,
                                    max_posts = number_posts )

    return jsonify_response( ReturnStructure( data = posts ) )


class CreateProjectPostForm(Form):
    title = TextField("title", validators=[Required()])
    description = TextAreaField("description", validators=[Required()])
    social_sharing = FieldList( TextField("social_sharing"), min_entries=0 )
    project_id = TextField("project_id", validators=[Required()])
    response_to_id = TextField("response_to_id")
    visibility = TextField("visibility")


@post_api.route('/add_post', methods = ['POST'])
@login_required
@project_exists
@project_member
def api_add_project_post():
    """
    ABOUT
        Method to add a post to a give project
    METHOD
        Post
    INPUT
        title - REQUIRED, 
        description - REQUIRED, 
        project_id - REQUIRED,
        social_sharing ['facebook', 'twitter'] - LIST, optional, 
        
        visibility 'public' or 'private'.  If not supplied defaults to private or
          if this is a response_to post, defaults to the response_to post visibility.
          Also only organizers can amke private posts.

        response_to_id - original post ID,
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
    social_sharing = request.form.getlist('share_to')
    project_id = request.form.get('project_id')
    response_to_id = request.form.get('response_to_id')
    visibility = requests.form.get('visibility')


    return _create_project_post(title = title,
                                description = description,
                                social_sharing = social_sharing,
                                project_id = project_id,
                                response_to_id = response_to_id,
                                visibility = visibility)



class EditProjectPostForm(Form):
    post_id = TextField("post_id", validators=[Required()])
    title = TextField("title")
    description = TextAreaField("description")


@post_api.route('/edit', methods = ['POST'])
@login_required
@post_exists
@post_edit_permission
def api_edit_post():
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

    infoStr = "Post {0} edited by {1}.".format(id, g.user.id)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( data = post.as_dict() ) )




class DeleteProjectPostForm(Form):
    post_id = TextField("post_id", validators=[Required()])

@post_api.route('/delete', methods = ['POSTS'])
@login_required
@post_exists
@post_delete_permission
def api_delete_post():

    form = DeleteProjectPostForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    post_id = requests.form.get('post_id')

    post = ProjectPosts.objects.with_id( post_id )
    post.delete()

    infoStr = "User {0} deleted post {1}".format(g.user.id, post_id)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( ) )

