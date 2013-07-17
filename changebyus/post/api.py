# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, request, render_template, redirect
from flask import url_for, g, current_app

from flask.ext.login import login_required, current_user

from .models import ProjectPost, Project, User, SocialMediaObject
from ..facebook.facebook import _post_user_facebook_feed
from ..twitter.twitter import _post_user_twitter_update
from ..bitly.api import _get_bitly_url

from ..helpers.mongotools import db_list_to_dict_list

from ..stream.api import _get_user_stream

from ..project.api import _get_user_involved_projects, _get_project_users_and_common_projects
from ..project.api import _user_involved_in_project

from ..stripe.api import _get_account_balance_percentage
from ..twitter.twitter import _get_user_name_and_thumbnail
from ..facebook.facebook import _get_fb_user_name_and_thumbnail

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

@post_api.route('/project/<id>/listposts')
@login_required
def api_get_project_posts(id):
    """
    ABOUT
        Given a project id, return the posts for that project that the current
        user posted.  ie view your contributions to a project
    METHOD
        Get
    INPUT
        Project ID
    OUTPUT
        Json list of posts.  Blank if user is not a member of project or has not posted.
    PRECONDITIONS
        User is logged in
    TODO
        Add filtering for the user, ie max number of posts, search by string, etc
    """
    posts = ProjectPost.objects( user = User.objects.with_id(g.user.id),
                                 project = id)

    posts = []
    for p in posts:
        posts.append( p.as_dict())

    return gen_ok( jsonify(posts=posts))




@post_api.route('/addprojectpost', methods = ['POST'])
@login_required
def api_add_project_post_no_id():
    """
    ABOUT
        Just a wrapper for the /project/<id>/addpost url
    METHOD
        Post
    INPUT
        project_id, see api_add_project_post()
    OUTPUT
        see api_add_project_post()
    PRECONDITIONS
        User is logged in  
    """
    return api_add_project_post(request.form['project_id'])


@post_api.route('/project/<id>/addpost', methods = ['POST'])
@login_required
def api_add_project_post(id):
    """
    ABOUT
        Method to add a post to a give project
    METHOD
        Post
    INPUT
        title, description, share to ['facebook', 'twitter', 'private', 'public']
    OUTPUT
        A render of the 'stream.html' html file viewing posts for a given project.
        This should become a pure API routine and just return a status code
    PRECONDITIONS
        User is logged in, user is a member or owner of the project
    TODO
        Convert to a pure API routine where we only create the post and return a status code.
        Create a group_member decoratoe so we don't explicitly need to check for membership in code
        Do verification on the title and description
    """
    title = request.form['title']
    description = request.form['description']
    social_sharing = request.form.getlist('share_to')
    user = User.objects.with_id(g.user.id)
    project = Project.objects().with_id(id)

    if project is None:
        current_app.logger.warning("Called with a bad project_id of {0}".format(id))

    if not _user_involved_in_project(project_id=project.id, user_id=g.user.id):
        infoStr = "User {0} tried to post to project {1} they are not involved with.".format(g.user.id,
                                                                                             project.id)
        current_app.logger.info(infoStr)
        abort(403)


    pp = ProjectPost( project = project, 
                      user = user,
                      title = title, 
                      description = description)

    # save once to ensure record
    pp.save()

    project_url = url_for('project_view.project_view_id', id=id, _external=True)

    # do social posts as necessary
    fb_post = None
    if 'facebook' in social_sharing:

        # socialMediaObject is an optional embedded field
        if pp.social_object == None:
            pp.social_object = SocialMediaObject()
        
        fb_post = _post_user_facebook_feed(link=project_url,
                                       name=title,
                                       description=description)

        if fb_post[0]:
            pp.social_object.facebook_id = str(fb_post[1])


    twitter_tweet = None
    if 'twitter' in social_sharing:

        # socialMediaObject is an optional embedded field
        if pp.social_object == None:
            pp.social_object = SocialMediaObject()

        shortened_url = _get_bitly_url(project_url)
    
        tweet_base = " posted to " + project.name + " on ChangeBy.Us " + shortened_url
        tweet = title[0:140-len(tweet_base)] + tweet_base

        twitter_tweet = _post_user_twitter_update(status=tweet)

        if twitter_tweet[0]:
            pp.social_object.twitter_id = str(twitter_tweet[1])


    if 'private' in social_sharing and 'public' not in social_sharing:
        pp.public = False


    # save after social stuff in case we changed it
    pp.save()

    infoStr = "Post for project {0} created by user {1} description {2}".format(id,
                                                                                g.user.id,
                                                                                pp.description)
    current_app.logger.info(infoStr)

    projects = _get_user_involved_projects(g.user.id)
    posts = _get_user_stream(g.user.id)
    members = _get_project_users_and_common_projects(None, g.user.id)

    
    # prepare the dictionary for rendering, do a little manipulating
    for project in projects:
        if project.has_key('stripe_account') and project['stripe_account'] is not None:
            project['account_id'] = project['stripe_account']['id']
            project['balance'], project['percentage'] = \
                _get_account_balance_percentage(project['account_id'])

            project['access_token'] = project['stripe_account']['access_token']                
            project['account_key'] = project['stripe_account']['publishable_key']
            project['stripe_description'] = project['stripe_account']['description']

    return render_template('stream.html', data = projects, posts = posts, members = members, newPost=True, twitter=twitter_tweet, fb=fb_post)

    #TEMPORARY CHANGE
    #return gen_ok( jsonify( pp.as_dict()))



@post_api.route('/<id>/edit', methods = ['POST'])
@login_required
def api_edit_post(id):
    """
    ABOUT
        Allow for the editing of an existing post
    METHOD
        Post
    INPUT
        post id, title, description
    OUTPUT
        Json structure representing the modified post
    PRECONDITIONS
        User is logged in, user is the owner of the post or owner of the group
    TODO
        Allow updating of related events, images, and most importantly update
        social posts.
    """
    post = ProjectPost.objects.with_id(id)
    if post.count() == 0:
        return not_found("Post does not exist")

    curr_user = Users.objects.with_id(g.user.id)

    # TODO does a reference field get looked up when I get object?
    # TODO test this id logic, probably wrong, plus I'm sure I need to 
    # de-reference the fields
    if post.user is not curr_user and post.project.owner is not curr_user:
        return no_permission("You are not the poster or group owner")

    title = request.form['title']
    description = request.form['description']

    # TODO handle social link updating
    if title: post.title = title
    if description: post.description = description
    post.save()

    infoStr = "Post {0} edited by {1}.".format(id, g.user.id)
    current_app.logger.info(infoStr)

    return gen_ok( jsonify( post.as_dict()))


def _get_project_post_stream(id=None, private_data=False):
    """
    ABOUT
        Get a list of all the posts for a given project.  Either include
        or don't include the private posts
    METHOD
        Get
    INPUT
        project id, private_data boolean
    OUTPUT
        Python Dict list of project posts
    PRECONDITIONS
        None
    """
    project = Project.objects.with_id(id)

    if private_data:
        # force a created_at sort, especially important for imported data
        posts = ProjectPost.objects(project=project).order_by('-created_at')
    else:
        posts = ProjectPost.objects(project=project,
                                    public=True).order_by('-created_at')

    return db_list_to_dict_list(posts)

