# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import current_app as app, Blueprint, url_for

from flask.ext.mail import Message

import requests
import yaml
import os
import inspect
import requests
import urllib
import smtplib

from sets import Set

from changebyus.user.models import User, UserNotifications
from changebyus.project.models import Project, UserProjectLink
from changebyus.project.helpers import ( _get_project_organizers, _get_project_members)

notifications_api = Blueprint('notificiations_api', __name__, url_prefix='/api/notifications')


class EmailUser:
    def __init__(self, email, name):
        self.email = email
        self.name = name

    def __eq__(self, other):
        if isinstance(other, EmailUser):
            return self.email == other.email

        return False

NoneEmailUser = EmailUser(None, None)

def _notify_flagged_project(project_id=None):
    """
        flags a project, notifies the owner and organizer
    """

    project = Project.objects.with_id(project_id)

    # first handle the owner
    recipients = set()
    if project.owner.notifications.flags_me:
        recipients.add(project.owner.email)

    # now handle the organizers
    organizers = _get_project_organizers(project_id)
    for organizer in organizers:
        if organizer['notifications']['flags_me']:
            recipients.add( EmailUser(organizer['email'], organizer['first_name'] ) )

    emailUsers = list(recipients)
    _send_flagged_project_email(emailUsers)


def _send_flagged_project_email(emailUsers, project):
    """
        TODO needs updating
    """

    for user in emailUsers:
        if user.email is None:
            continue

        msg = Message("Your CBU project \"{0}\" was flagged.".format( project.name ),
                      recipient = user.email)

        msg.body = "Hello {0}\n".format(user.name)
        msg.body += "Your project got flagged."

        msg.html = "Hello {0}<br>".format(user.name)
        msg.html += "Your project got flagged."
        
        current_app.mail.send(msg)
    



def _notify_flagged_user(user_id=None):
    """
        flags_me
    """

    user = User.objects.with_id(user_id)

    if user.notifications.flags_me:
        email = EmailUser(user.email, user.first_name)
        _send_flagged_user_email([email])


def _send_flagged_user_email(emailUsers):

    """
        flags_me
        TODO needs updating
    """

    for user in emailUsers:
        if user.email is None:
            continue

        msg = Message("Your were flagged.",
                      recipient = user.email)

        msg.body = "Hello {0}\n".format(user.name)
        msg.body += "You got flagged."

        msg.html = "Hello {0}<br>".formart(user.name)
        msg.html += "You got flagged."
        
        current_app.mail.send(msg)




def _notify_flagged_post( post_id=None ):
    """
        flags_me
        TODO needs updating
    """

    from ..post.models import ProjectPost

    post = ProjectPost.objects.with_id(post_id)
    user = post.user

    if user.notifications.flags_me:
        email = EmailUser(user.email, user.first_name)
        _send_flagged_post_email([email])


def _send_flagged_post_email(emailUsers):

    for user in emailUsers:
        if user.email is None:
            continue

        msg = Message("Your post was flagged.",
                      recipient = user.email)

        msg.body = "Hello {0}\n".format(user.name)
        msg.body += "Your post got flagged."

        msg.html = "Hello {0}<br>".formart(user.name)
        msg.html += "Your post got flagged."
        
        current_app.mail.send(msg)




def _notify_project_join( project_id=None, user_name=None ):
    """
    Handles:
        joins_my_project
        joins_common_project
    """

    emails = set()

    project = Project.objects.with_id( project_id )
    
    owner = project.owner
    if owner.notifications.joins_my_project or owner.notifications.joins_common_project:
        emails.add( EmailUser(owner.email, owner.first_name ) )

    links = UserProjectLink.objects(project = project)
    for link in links:
        if link.user.notifications.joins_common_project:
            emails.add( EmailUser(user.email, user.first_name ) )


    emailUsers = list(emails)
    _send_project_join_email(emailUsers, project, user_name)


def _send_project_join_email( emailUsers, project, user_name ):

    resource = project.resource
    project_url = url_for('project_view.project_view_id', project_id=project.slug)
    # TODO need url for user
    user_url = "Need url for user inserted"

    action = "joined" if resource is False else "followed"
    description = "project" if resource is False else "resource"

    for user in emailUsers:
        if user.email is None:
            continue

        msg = Message("{0} {1} your {2} {3}.".format( user_name, action, description, project.name ),
                      recipient = user.email)

        msg.body = "Hello {0},\n".format(user.name)
        msg.body += "{0} has {1} your {2} {3}.\n".format( user_name, action, description, project.name )
        msg.body += "View profile : {0}".format(user_url)

        msg.html = "Hello {0},<br>".format(first_name)        
        msg.html += "The user {0} has {1} <a href = \"{2}\">CBU {3} {4}.</a><br>".format( user_name, 
                                                                                          action,
                                                                                          url,
                                                                                          description,
                                                                                          project.name )
        msg.html += "Please visit the project by clicking the link above.<br>"

        current_app.mail.send(msg)




def _notify_post( post_id=None ):
    """
    Notify the original poster and all poster responders that there's been
    another response

    """

    # TODO why does this have to be a local include?
    from ..post.models import ProjectPost

    # get the newest post and the parent post
    newest_post = ProjectPost.objects.with_id(post_id)

    if newest_post.parent_id:
        original_post = ProjectPost.objects.with_id(newest_post.parent_id)
    else:
        original_post = newest_post

    # all commentors on update.  Update is public
    # gather all the people associated with this comment, needed for the
    # responds_to_my_comment notification flag
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

        users = _compile_update_notification_users( update_commentors = update_commentors,
                                                    original_post = original_post,
                                                    newest_post = newest_post,
                                                    project = project,
                                                    project_organizers = project_organizers,
                                                    project_members = project_members,
                                                    project_owner = project_owner)

        _send_update_notification_email(emailUsers = users, 
                                        project = project, 
                                        post = newest_post)

    else:

        users = _compile_discussion_notification_users( original_post = original_post,
                                                        newest_post = newest_post,
                                                        project = project,
                                                        project_organizers = project_organizers,
                                                        project_members = project_members,
                                                        project_owner = project_owner)

        _send_discussion_notification_email(emailUsers = users, 
                                            project = project,
                                            post = newest_post)



    def _compile_update_notification_users(update_commentors=None, 
                                           original_post=None, 
                                           newest_post=None,
                                           project=None, 
                                           project_organizers=None, 
                                           project_members=None, 
                                           project_owner=None):

        # store emails in sets
        update_set = set()

        # response to a update I commented on
        #    responds_to_my_comment
        #    NEEDS: all commentors on update
        for responder in update_commentors:
            if responder.notifications.responds_to_my_comment:
                update_set.add( EmailUser(responder.email, responder.first_name) )


        # response to an update I created
        #    responds_to_my_update
        #    NEEDS: poster of update
        if original_post.user.notifications.responds_to_my_update:
            update_set.add( EmailUser(original_post.user.email, original_post.user.first_name) )


        # update to a project I own or organize
        #    posts_update_to_my_project
        #    NEEDS: project owner, project organizers
        if project.owner.notifications.posts_update_to_my_project:
            update_set.add( EmailUser(project.owner.email, project.owner.first_name) )

        for organizer in project_organizers:
            if organizer['notifications']['posts_update_to_my_project']:
                update_set.add( EmailUser(organizer['email'], organizer['first_name']) )


        # someone posts an update to a project I'm involved in (owner, member, organizer)
        #    posts_update_common_project
        #    NEEDS: members, owner, organizers
        if project.owner.notifications.posts_update_common_project:
            update_set.add( EmailUser(project.owner.email, project.owner.full_name) )

        for organizer in project_organizers:
            if organizer['notifications']['posts_update_common_project']:
                update_set.add( EmailUser(organizer['email'], organizer['first_name']) )

        for member in project_members:
            if member['notifications']['posts_update_common_project']:
                update_set.add( EmailUser(member['email'], member['first_name']) )


        # now clean the data
        # don't notify the poster
        update_set.add( EmailUser(newest_post.user.email, None) )
        update_set.remove( EmailUser(newest_post.user.email, None) )

        emails = list(update_set)

        return emails



    def _send_update_notification_email( emailUsers=None,
                                         project=None, 
                                         post=None ):


        resource = post.project.resource
        url = url_for('project_view.project_view_id', project_id=project.slug)

        description = "resource" if resource else "project"

        for user in emailUsers:
            if user.email is None:
                continue

            msg = Message("Update to the CBU {0} \"{1}\".".format( description, project.name ),
                          recipient = user.email)

            msg.body = "Hello\n"
            msg.body += "Just letting you know that there was an update or response to an "
            msg.body += "update posted to {0} with the title '{1}'.\n".format( project.name, post.title )
            msg.body += "Please view the {0} page at {1}".format( description, url )

            msg.html = "Hello<br>"
            msg.html += "Just letting you know that there was an update or response to an "
            msg.html += "update posted to {0} with the title '{1}'.<br>".format( project.name, newest_post.title )
            msg.html += "Please view the {0} page, <a href={1}>here.</a>".format( description, url )
            
            current_app.mail.send(msg)



    def _compile_discussion_notification_users( original_post = None,
                                                newest_post=None,
                                                project = None,
                                                project_organizers = None,
                                                project_members = None,
                                                project_owner = None):

        # store emails in sets
        discussion_set = set()

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
                discussion_set.add( EmailUser(project_owner.email, project_owner.first_name) )
        else:
            # it's a response
            if project_owner.notifications.responds_to_a_discussion:
                discussion_set.add( EmailUser(project_owner.email, project_owner.first_name) )

        ## ORGANIZERS
        for organizer in project_organizers:
            if original_post == newest_post:
                if organizer['notifications']['posts_discussion']:
                    discussion_set.add( EmailUser(organizer['email'], organizer['first_name']) )
            else:
                if organizer['notifications']['responds_to_a_discussion']:
                    discussion_set.add( EmailUser(organizer['email'], organizer['first_name']) )


        # now clean the data and send the email

        # don't notify the poster
        discussion_set.add( newest_post.user.email )
        discussion_set.remove( newest_post.user.email )

        emails = list(discussion_set)
        return emails



    def _send_discussion_notification_email(emailUsers = None, 
                                            project = None,
                                            post = None):

        description = "resource" if resource else "project"

        for user in emailUsers:
            if user.email is None:
                continue

            msg = Message("User has joined the CBU Project \"{0}\".".format( project.name ),
                          recipient = user.email)

            msg.body = "Hello\n"
            msg.body += "Just letting you know that there was a discussion posted or a response to "
            msg.body += "a discussion posted to {0} with the title '{1}'.\n".format( project.name, newest_post.title )
            msg.body += "Please view the {0} page at {1}".format( description, url )

            msg.html = "Hello<br>"
            msg.html += "Just letting you know that there was a discussion posted or a response to "
            msg.html += "a discussion posted to {0} with the title '{1}'.<br>".format( project.name, newest_post.title )
            msg.html += "Please view the {0} page, <a href={1}>here.</a>".format( description, url )
            
            current_app.mail.send(msg)





