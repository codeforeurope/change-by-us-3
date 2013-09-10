# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, current_app

from flask_mail import Message
from flask.ext.flask_cdn import url_for

import requests
import yaml
import os
import inspect
import requests
import urllib
import smtplib

from sets import Set

from ..user.models import User, UserNotifications
from ..project.models import Project
from ..post.models import ProjectPost

notifications_api = Blueprint('notificiations_api', __name__, url_prefix='/api/notifications')

BASE_URL = 'https://api-ssl.bitly.com'


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


def _notify_project_join(project_id=None, user=None):
    """
    Handles:
        joins_my_project
        joins_common_project

    """

    emails = []

    project = Project.objects.with_id( project_id )
    if project is None:
        return False

    owner = project.owner
    if owner.notifications.joins_my_project and owner.email:
        emails.append( owner.email )

    users = UserProjectLink.objects(project = project)
    for user in users:
        if user.notifications.joins_common_project and user.email:
            emails.append( user.email )

    # TODO send the actual email

    if len(emails) > 0):
        msg = Message("User has joined the CBU Project \"{0}\".".format( project.name ),
                      recipients = emails)

        msg.body = "Hello,\n"
        msg.body += "The user {0} has joined CBU project {1}.\n".format(user.display_name, project.name)
        msg.body += "Please visit the project at {2}".format( url_for('api_get_project_slug', project_slug = project.slug) )

        msg.html = "Hello,<br>"
        msg.html += "The user {0} has joined <a href = \"{1}\">CBU project {2}.</a><br>".format( user.display_name, 
                                                                                                 url_for('api_get_project_slug', project_slug = project.slug),
                                                                                                 project.name )
        msg.html += "Please visit the project by clicking the link above.<br>"

        current_app.mail.send(msg)


def _notify_post(post_id=None, user=None):
    """
    Notify the original poster and all poster responders that there's been
    another response


    responds_to_my_comment
    responds_to_my_update
    responds_to_a_discussion
    posts_update_to_my_project
    posts_discussion
    posts_update_common_project

    """
    
    newest_post = ProjectPost.objects.with_id(post_id)
    if newest_post is None:
        return False

    if newest_post.parent_id:
        original_post = ProjectPost.objects.with_id(newest_post.parent_id)
    else:
        original_post = newest_post

    if original_post is None:
        return False


    # unique set
    users = Set()
    for response in original_post.responses:
        users.add( response.user )

    # don't notify the poster
    users.remove( newest_post.user )

    post_url = current_app.settings['BASE_URL'] + url_for('project.project_view_id', project_id = original_post.project.id)

    for user in users:
        if user.notifications.responds_to_my_post and user.email:
            msg = Message('There was a response to "{0}" on ChangeByUs'.format(original_post.title))
            msg.body = "Hello {0}\n".format(user.first_name)
            msg.body += "There was a response to the post on ChangeByUs, titled {0}\n\n".format(original_post.title)
            msg.body += "Post by {0}: \n {1}\n\n".format(newest_post.user.display_name)
            msg.body += "To view in ChangeByUs, please go to {0}".format(post_url)







