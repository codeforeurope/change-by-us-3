# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, current_app

from flask.ext.cdn import url_for

from flask.ext.mail import Message

import requests
import yaml
import os
import inspect
import requests
import urllib
import smtplib

from sets import Set

from ..user.models import User, UserNotifications
from ..project.models import Project, UserProjectLink
from ..project.helpers import ( _get_project_organizers, _get_project_members,
                                _get_slug_url )

notifications_api = Blueprint('notificiations_api', __name__, url_prefix='/api/notifications')


"""
=========================
Bit.ly Webservice Wrapper
=========================

This is a webservice that will send large urls to bitly and return the 
shortened url.  The use case is rather obvious.
"""

def _notify_flagged_project(project_id=None):
    """
        flags_me
    """

    pass

def _notify_flagged_user(user_id=None):
    """
        - break it down based on what can get flagged.  TBD

        flags_me
    """

    pass


def _notify_project_join( project_id=None, user_name=None ):
    """
    Handles:
        joins_my_project
        joins_common_project

    """


    emails = Set()

    project = Project.objects.with_id( project_id )
    if project is None:
        return False

    owner = project.owner
    if owner.notifications.joins_my_project:
        emails.add( owner.email )

    links = UserProjectLink.objects(project = project)
    for link in links:
        if link.user.notifications.joins_common_project:
            emails.add( user.email )

    # clean out the None email
    emails.add( None )
    emails.remove( None )

    # TODO send the actual email

    resource = project.resource
    url = _get_slug_url( project.id )

    action = "joined" if resource is False else "followed"
    description = "Project" if resource is False else "Resource"

    emails_list = list(emails)

    if len(emails_list) > 0:
        msg = Message("User has {0} the CBU {1} \"{2}\".".format( action, description, project.name ),
                      recipients = emails_list)

        msg.body = "Hello,\n"
        msg.body += "The user {0} has {1} CBU {2} {3}.\n".format(user_name, action, description, project.name)
        msg.body += "Please visit the {0} at {1}".format( description, url )

        msg.html = "Hello,<br>"
        msg.html += "The user {0} has {1} <a href = \"{2}\">CBU {3} {4}.</a><br>".format( user_name, 
                                                                                          action,
                                                                                          url,
                                                                                          description,
                                                                                          project.name )
        msg.html += "Please visit the project by clicking the link above.<br>"

        current_app.mail.send(msg)


def _notify_post( post_id=None):
    """
    Notify the original poster and all poster responders that there's been
    another response

    """

    # store emails in sets
    update_set = Set()
    discussion_set = Set()

    # TODO why does this have to be a local include?
    from ..post.models import ProjectPost

    # get the newest post and the parent post
    newest_post = ProjectPost.objects.with_id(post_id)
    if newest_post is None:
        return False

    if newest_post.parent_id:
        original_post = ProjectPost.objects.with_id(newest_post.parent_id)
    else:
        original_post = newest_post

    if original_post is None:
        return False


    resource = original_post.project.resource
    url = _get_slug_url( original_post.project.id )

    # all commentors on update.  Update is public
    update_commentors = []
    if original_post.public:
        for response in original_post.responses:
            update_commentors.append( response.user )

    # poster of an update
    update_poster = None
    if original_post.public:
        update_poster = original_post.user

    # get owner
    project_owner = original_post.project.owner
    project = original_post.project

    # get organizers and members
    project_organizers = _get_project_organizers( original_post.project.id )
    project_members = _get_project_members( original_post.project.id )

    if original_post.public:
        #### UPDATES

        # response to a update I commented on
        #    responds_to_my_comment
        #    NEEDS: all commentors on update
        for responder in update_commentors:
            if responder.notifications.responds_to_my_comment:
                update_set.add( responder.email )


        # response to an update I created
        #    responds_to_my_update
        #    NEEDS: poster of update
        if original_post.user.notifications.responds_to_my_update:
            update_set.add( original_post.user.email )


        # update to a project I own or organize
        #    posts_update_to_my_project
        #    NEEDS: project owner, project organizers
        if project.owner.notifications.posts_update_to_my_project:
            update_set.add( project.owner.email )

        for organizer in project_organizers:
            if organizer['notifications']['posts_update_to_my_project']:
                update_set.add( organizer['email'] )


        # someone posts an update to a project I'm involved in (owner, member, organizer)
        #    posts_update_common_project
        #    NEEDS: members, owner, organizers

        if project.owner.notifications.posts_update_common_project:
            update_set.add( project.owner.email )

        for organizer in project_organizers:
            if organizer['notifications']['posts_update_common_project']:
                update_set.add( organizer['email'] )

        for member in project_members:
            if member['notifications']['posts_update_common_project']:
                update_set.add( member['email'] )


        # now clean the data and send the email

        # don't notify the poster
        update_set.add( newest_post.user.email )
        update_set.remove( newest_post.user.email )

        # remove the None email if it exists
        update_set.add(None)
        update_set.remove(None)

        emails = list(update_set)

        description = "resource" if resource else "project"

        if len(emails) > 0:

            msg = Message("User has joined the CBU Project \"{0}\".".format( project.name ),
                          recipients = emails)

            msg.body = "Hello\n"
            msg.body += "Just letting you know that there was an update or response to an "
            msg.body += "update posted to {0} with the title '{1}'.\n".format( project.name, newest_post.title )
            msg.body += "Please view the {0} page at {1}".format( description, url )

            msg.html = "Hello<br>"
            msg.html += "Just letting you know that there was an update or response to an "
            msg.html += "update posted to {0} with the title '{1}'.<br>".format( project.name, newest_post.title )
            msg.html += "Please view the {0} page, <a href={1}>here.</a>".format( description, url )
            
            current_app.mail.send(msg)



    else:
        #### DISCUSSIONS

        # someone posts a discussion on a project I own or organize
        #    posts_discussion
        #    NEEDS: project owner, project_organizers

        # someone responds to a discussion on a project I own or organize
        #    responds_to_a_discussion
        #    NEEDS: project owner, project organizers

        ## OWNER
        if original_post == newest_post:
            # it's a new post
            if project_owner.notifications.posts_discussion:
                discussion_set.add( project_owner.email )
        else:
            # it's a response
            if project_owner.notifications.responds_to_a_discussion:
                discussion_set.add( project_owner.email )

        ## ORGANIZERS
        for organizer in project_organizers:
            if original_post == newest_post:
                if organizer['notifications']['posts_discussion']:
                    discussion_set.add( organizer['email'] )
            else:
                if organizer['notifications']['responds_to_a_discussion']:
                    discussion_set.add( organizer['email'] )


        # now clean the data and send the email

        # don't notify the poster
        discussion_set.add( newest_post.user.email )
        discussion_set.remove( newest_post.user.email )

        # remove the None email if it exists
        discussion_set.add(None)
        discussion_set.remove(None)

        emails = list(discussion_set)

        description = "resource" if resource else "project"

        if len(emails) > 0:

            msg = Message("User has joined the CBU Project \"{0}\".".format( project.name ),
                          recipients = emails)

            msg.body = "Hello\n"
            msg.body += "Just letting you know that there was a discussion posted or a response to "
            msg.body += "a discussion posted to {0} with the title '{1}'.\n".format( project.name, newest_post.title )
            msg.body += "Please view the {0} page at {1}".format( description, url )

            msg.html = "Hello<br>"
            msg.html += "Just letting you know that there was a discussion posted or a response to "
            msg.html += "a discussion posted to {0} with the title '{1}'.<br>".format( project.name, newest_post.title )
            msg.html += "Please view the {0} page, <a href={1}>here.</a>".format( description, url )
            
            current_app.mail.send(msg)







