# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for
from flask.ext.login import login_required, current_user, login_user

from ..project.api import _get_user_involved_projects
from ..post.models import ProjectPost

from ..helpers.flasktools import gen_ok, gen_blank_ok
from ..helpers.mongotools import db_list_to_dict_list

stream_api = Blueprint('stream_api', __name__, url_prefix='/api/stream')

"""
============
Stream API
============

An API that will help provide posts related to projects
"""

def _get_user_stream(user_id, project_id=None, max_posts=100):
    """
    ABOUT
        Retrieves a list of posts for given project id or all the
        projects a user is a member of.
    METHOD
        Native Python
    INPUT
        user_id, project_id (optional), max_posts (default 100)
    OUTPUT
        list of dictionaries of post objects, sorted by their created_at
        timestamp
    PRECONDITIONS
        None
    TODO:
        This should check to only show public or private posts to a user
        depending on their involvement in the specified project.  This is only
        an issue when we specify project_id = 
    """
    if project_id is None or len(project_id) == 0:
        projects= _get_user_involved_projects(user_id)
        posts = []

        # TODO move this to mongoengine side
        for project in projects:
            # we got back a dict so base on id
            # TODO this should be a function from ProjectPost now a low level DB call
            project_posts = ProjectPost.objects( project = project['id'] )
            for post in project_posts:
                posts.append(post)


        def postCompare(a, b):
            # swap b and a for newest first
            return cmp(b.created_at, a.created_at)

        posts.sort(postCompare)
        return db_list_to_dict_list(posts[0:max_posts])

    else:
        # TODO this should be a function from ProjectPost now a low level DB call
        posts = ProjectPost.objects( project = project_id ).limit(max_posts)

        return db_list_to_dict_list(posts)


@stream_api.route('/')
@login_required
def api_stream():
    """
    ABOUT
        View to return a jsonified list of posts for a user, based on the
        projects they are joined to
    METHOD
        Get
    INPUT
        None
    OUTPUT
        Jsonified list of project posts, for projects the user is involved with
    PRECONDITIONS
        API key exists in the config file
    """
    streamList = _get_user_stream(g.user.id)
    return gen_ok( jsonify(stream=streamList))
