# -*- coding: utf-8 -*-

from flask import g, current_app


from ..user.models import User
from ..helpers.mongotools import db_list_to_dict_list
from ..helpers.flasktools import ReturnStructure, jsonify_response
from ..project.decorators import _is_organizer as _is_project_organizer
from ..notifications.api import _notify_post

from flask.ext.cdn import url_for

from .models import Project, ProjectPost, SocialMediaObject

from ..post.activity import update_project_activity

"""
.. module:: post/helpers

   :synopsis: Set of helper functions that handle project posts

"""

def _get_project_post_stream(project_id=None, private_data=False):
    """Gets a list of posts for a given project

    Args:
        project_id: the id of the project
        private_date: boolean dictating whether or not we should return private posts
    Returns:
        A list of dicts of posts
    """
    project = Project.objects.with_id(project_id)

    if private_data:
        # force a created_at sort, especially important for imported data
        posts = ProjectPost.objects(project=project).order_by('-created_at',
                                    parent_id = None)
    else:
        posts = ProjectPost.objects(project=project,
                                    parent_id = None,
                                    public=True).order_by('-created_at')

    return db_list_to_dict_list(posts)





def _create_project_post(title = None,
                         description = None,
                         social_sharing = None,
                         project_id = None,
                         response_to_id = None,
                         visibility = None):

    """Creates a project post

    Args:
        title: title of post
        description: description of post
        social_sharing: list with either 'facebook', 'twitter', or both
        project_id: the id of the project post is appended to
        response_to_id: the id of the post this is a response to
        visibility: 'public' or 'private'

    Rules:
        Only organizers can create updates
        Members can respond to updates
        Only organizers can create discussions
        Only orgnizers can respond to discussions

    Returns:
        A dict representing the post if successful
    """


    # a little validation
    if not (visibility is None or visibility.lower() in ['public', 'private']):
        errStr = "Visibility must be public or private.  "
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project = Project.objects().with_id(project_id)
    user = User.objects.with_id(g.user.id)

    # verify the user has permission for the post.
    # - we have logic where you need to be an organizer to make a public post,
    #   only public initial posts (not responses) can be sent to social media
    # - you need to be an organizer to post or respond to a discussion and they
    #   can not be posted to social media.
    # - this could be changed for your specific application
    is_response_post = response_to_id is not None
    is_organizer = _is_project_organizer(project, user.id)
    is_private_post = True if visibility is None else visibility.lower() == 'private'
    is_social_post = 'facebook' in social_sharing or 'twitter' in social_sharing

    permission = False

    # organizers can do anything
    if is_organizer: permission = True
    # anyone can respond to a post
    elif is_response_post and not is_private_post: permission = True

    # now double check social posting logic
    if is_social_post and not is_private_post and (not is_organizer or is_response_post):
        permission = False

    if not permission:
        errStr = "User does not have permission for this type of post."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    # verify the original post exists
    if is_response_post:
        original_post = ProjectPost.objects.with_id(response_to_id)
        
        if original_post is None or original_post.project != project:
            errMsg = "Post is a response to an invalid original post"
            return jsonify_response( ReturnStructure( success = False, 
                                                      msg = errStr ) )

        # just overwrite the current visibility for responses
        is_private_post = not original_post.public
     

    pp = ProjectPost( project = project, 
                      user = user,
                      title = title, 
                      description = description,
                      public = not is_private_post)

    if is_response_post:

        pp.parent_id = str(original_post.id)
        # save to get database_id
        pp.save()

        original_post.responses.append(pp)
        original_post.save()


    if is_social_post:

        # save if necessary to get id
        if pp.is_new():
            pp.save()

        # TODO convert this to slug
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


    # save after social stuff in case we changed it
    pp.save()

    infoStr = "Post for project {0} created by user {1} description {2}".format(project_id,
                                                                                g.user.id,
                                                                                pp.description)
    current_app.logger.info(infoStr)

    _notify_post( post_id = pp.id )

    update_project_activity( project_id )

    return jsonify_response( ReturnStructure( data = pp.as_dict() ))

