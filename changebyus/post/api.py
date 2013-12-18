# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from flask import Blueprint, request, render_template, redirect
from flask import url_for, g, current_app

from flask.ext.cdn_rackspace import upload_rackspace_image

from flask.ext.login import login_required, current_user

from flask.ext.wtf import (Form, TextField, TextAreaField, FileField, 
                           SubmitField, Required, ValidationError)

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

from ..helpers.flasktools import jsonify_response, ReturnStructure, as_multidict

from ..stripe.api import _get_account_balance_percentage
from ..twitter.twitter import _get_user_name_and_thumbnail
from ..facebook.facebook import _get_fb_user_name_and_thumbnail

from .helpers import _create_project_post

post_api = Blueprint('post_api', __name__, url_prefix='/api/post')


"""
.. module:: post/api

    :synopsis: Posts exist on a per-project basis, with multiple posts per project possible.

    Posts can be public or private, and can have a link to social platforms, ie
    a twitter_post_id and a facebook_post_id, however the actual social posting
    is handled by other modules.
"""

@post_api.route('/<post_id>')
@post_exists
def api_get_post(post_id):
    """Get data for root post and all child response posts.

    Args:
        post_id: the id of the requested post
        limit: Maxinum number of responses to return
    Returns:
        A dict of the root post and all responses
    """

    limit = int(request.args.get('limit', 500))
    
    root_post = ProjectPost.objects.with_id(post_id)
    responses = ProjectPost.objects(parent_id = post_id)[0:limit]

    data = root_post.as_dict()

    data['responses'] = db_list_to_dict_list(responses)
    
    return jsonify_response(ReturnStructure(data = data))


@post_api.route('/project/<project_id>/<post_type>')
@project_exists
def api_get_project_posts(project_id, post_type):
    """Method to view a list of posts for a given project.

    Given a project id and post type **[discussions, updates, posts]**, returns a list of
    posts for the project.  **'discussions'** returns only private posts.  **'updates'** returns
    public posts.  **'posts'** returns both private and public.
    
    Args:
        project_id: the id of the selected project
        post_type: [discussions, updates, posts] a single selected post type
        limit: Maxinum number of posts to return

    Returns:
        Al list of dicts of all requested posts
    """

    limit = int(request.args.get('limit', 500))
    sort  = request.args.get('sort')
    order = request.args.get('order', 'asc')
 
    if post_type == 'discussions':
        private_posts = True
    elif post_type == 'updates':
        private_posts = False
    else:
        if g.user.is_anonymous():
            private_posts = False
        else:
            private_posts = _is_project_organizer( project_id, g.user.id )

    isPublic = (private_posts is False)

    if (sort):
        sort_order = "%s%s" % (("-" if order == 'desc' else ""), sort)
        posts = ProjectPost.objects( project = project_id,
                                     public = isPublic,
                                     parent_id = None )[0:limit].order_by(sort_order)
    else:
        posts = ProjectPost.objects( project = project_id,
                                     public = isPublic,
                                     parent_id = None )[0:limit]

    ret_posts = db_list_to_dict_list( posts )

    return jsonify_response( ReturnStructure( data = ret_posts ) )



class CreateProjectPostForm(Form):
    title           = TextField("title", validators=[Required()])
    description     = TextAreaField("description", validators=[Required()])
    social_sharing  = TextField('social_sharing')
    project_id      = TextField("project_id", validators=[Required()])
    response_to_id  = TextField("response_to_id")
    visibility      = TextField("visibility")


@post_api.route('/add/<post_type>', methods = ['POST'])
@login_required
@project_exists
@project_member
def api_add_project_post(post_type):
    """Method for adding posts to a given project

    Posts added to projects are either public or private.  Additionally,
    if the post is a public post, it can be shared on social services such as
    twitter and facebook.  For the CBU project we support post types of
    **[post, update, discussion]**.  **updates** are public and **discussions**
    are private, so they simply provide a means for making our apis more readable.
    **post** is public or private, but public by default.


    Args:
        post_type: 'posts', 'updates', or 'discussions'
        title: post title
        description: post description
        project_id: the id of the project we are adding a post to
        social_sharing: "['facebook', 'twitter']" - LIST, optional
        visibility: 'public' or 'private'.  This is overidden if the post_type is 'update' or 'discussion'.  'public' by default.
        response_to_id: the existing post this is a response to

    Returns:
        A dict representing the post object if successful.

    Preconditions:
        Logged in user is an owner/organizer/member of the project.
    """

    form = CreateProjectPostForm(request.form or as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    title          = form.title.data
    description    = form.description.data
    social_sharing = form.social_sharing.data
    project_id     = form.project_id.data
    response_to_id = form.response_to_id.data if form.response_to_id.data != '' else None
    visibility     = form.visibility.data if form.visibility.data != '' else None
    print 'social_sharing',social_sharing
    if post_type == 'update':
        visibility = 'public'
    elif post_type == 'discussion':
        visibility = 'private'

    return _create_project_post(title = title,
                                description = description,
                                social_sharing = social_sharing,
                                project_id = project_id,
                                response_to_id = response_to_id,
                                visibility = visibility)


class EditProjectPostForm(Form):
    post_id     = TextField("post_id", validators=[Required()])
    title       = TextField("title")
    description = TextAreaField("description")


@post_api.route('/edit', methods = ['POST'])
@login_required
@post_exists
@post_edit_permission
def api_edit_post():
    """Method for editing a post.

    .. note::
       Changes will not be propogated to social media.  Ie we will not edit 
       exisitng social media posts related to this post.

    Args:
        post_id: the id of the post to be edited
        title: the new title
        description: the new description

    Returns:
        A dict representing the edited project post, if successful.

    Preconditions:
        The logged in user has edit permission on the post
    """

    form = EditProjectPostForm(request.form or as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )


    post_id = form.post_id.data
    description = form.description.data
    title = form.title.data

    post = ProjectPost.objects.with_id(post_id)

    if description: post.description = description
    if title: post.title = title

    post.save()

    infoStr = "Post {0} edited by {1}.".format(id, g.user.id)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( data = post.as_dict() ) )




class DeleteProjectPostForm(Form):
    post_id = TextField("post_id", validators=[Required()])

@post_api.route('/delete', methods = ['POST'])
@login_required
@post_exists
@post_delete_permission
def api_delete_post():
    """Method to delete an existing post.

    .. note::
       Changes will not be propogated to social media.  Ie we will not delete 
       exisitng social media posts related to this post.

    Args:
        post_id: the id of the post to be edited

    Returns:
        True or False depending on success

    Preconditions:
        User has permission to delete the post
    """

    form = DeleteProjectPostForm(request.form or as_multidict(request.json))
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    post_id = form.post_id.data

    post = ProjectPost.objects.with_id( post_id )
    # Should we mark it as invalid not just delete it?
    post.delete()

    infoStr = "User {0} deleted post {1}".format(g.user.id, post_id)
    current_app.logger.info(infoStr)

    return jsonify_response( ReturnStructure( ) )


@post_api.route('/imageupload', methods = ['POST'])
@login_required
def api_upload_image(): 
    """In progress method for uploading images

    """

    if 'photo' not in request.files:
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = "photo not provided" ) )

    photo = request.files.get('photo')

    if len(photo.filename) < 3:
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = "filename invalid" ) )

    try:
        result = upload_rackspace_image( photo )

        if result.success:
            return jsonify_response( ReturnStructure ( success = False,
                                                       data = { "image_url" : result.url } ) )
        else:
            msg = "An error occured."
            return jsonify_response( ReturnStructure( success = False, 
                                                      msg = msg ) )  

    except Exception as e:
        current_app.logger.exception(e)
        msg = "An error occured."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = msg ) )


