# -*- coding: utf-8 -*-

from flask import g, current_app


from ..user.models import User
from ..helpers.flasktools import ReturnStructure, jsonify_response
from ..project.decorators import _is_organizer as _is_project_organizer

from .models import Project, ProjectPost, SocialMediaObject

def _get_posts_for_project(project_id = None, 
						   private_posts = False, 
						   max_posts = 10):

	if private_posts:
		posts = Project.objects( parent = None, 
			                     project = project_id )
	else:
		posts = Projects.objects( parent = None, 
			                      project = project_id,
			                      public = True )



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



def _create_project_post(title = None,
                         description = None,
                         social_sharing = None,
                         project_id = None,
                         response_to_id = None,
                         visibility = None):

    # a little validation
    errStr = ''
    if not (visibility is None or visibility.lower() in ['public', 'private']):
        errStr += "Visibility must be public or private.  "
    if not (social_sharing is None or social_sharing.lower() in ['facebook', 'twitter']):
        errStr += "Social Sharing must be blank or facebook / twitter."

    if len(errStr) > 0:
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    project = Project.objects().with_id(project_id)
    user = User.objects.with_id(g.user.id)


    # verify the user has permission for the post.
    # we have logic where you need to be an organizer to make a public post,
    # only public initial posts (not responses) can be sent to social media
    # but anyone can respond to anything 
    # this could be changed for your specific application
    is_response_post = response_to_id is not None
    is_organizer = _is_project_organizer(project, user.id)
    is_private_post = True if visibility is None else visibility.lower() == 'private'
    is_social_post = social_sharing is not None

    permission = False

    # organizers can do anything
    if is_organizer: permission = True
    # anyone can make a private post
    if is_private_post: permission = True
    # anyone can respond to a post
    if is_response_post: permission = True

    # now double check social posting logic
    if is_social_post and (not is_organizer or is_response_post):
        permission = False

    if not permission:
        errMsg = "User does not have permission for this type of post."
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

        project_url = url_for('project_view.project_view_id', id=id, _external=True)

        # do social posts as necessary
        fb_post = None
        if 'facebook' in social_sharing.lower():

            # socialMediaObject is an optional embedded field
            if pp.social_object == None:
                pp.social_object = SocialMediaObject()
            
            fb_post = _post_user_facebook_feed(link=project_url,
                                               name=title,
                                               description=description)

            if fb_post[0]:
                pp.social_object.facebook_id = str(fb_post[1])


        twitter_tweet = None
        if 'twitter' in social_sharing.lower():

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

    return jsonify_response( ReturnStructure( data = pp.as_dict() ))

