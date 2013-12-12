# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, g, render_template, redirect, url_for
from flask.ext.login import login_required, current_user, login_user

from ..project.helpers import _get_user_involved_projects
from ..post.models import ProjectPost

from ..helpers.flasktools import ReturnStructure, jsonify_response
from ..helpers.mongotools import db_list_to_dict_list

stream_api = Blueprint('stream_api', __name__, url_prefix='/api/stream')

"""
.. module: stream/api

    :synopsis: An API that will help provide posts related to projects

"""

def _get_user_stream(user_id, project_id=None, max_posts=100):
    """
        Retrieves a list of posts for given project id or all the
        projects a user is a member of.

        Args:
            user_id: id of the user the returned stream belongs to.
            project_id: list of projects to compile stream around.  If blank
                then all projects the user is involved in will be used.
            max_posts: the maxinum number of posts to return.

        Returns:
            list of dictionaries of top level post objects, sorted by 
            their created_at timestamp

        Todo:
            Need to only provide public or private posts based on user 
            project involvement.
    """
    if project_id is None or len(project_id) == 0:
        projects= _get_user_involved_projects(user_id)
        posts = []

        # TODO move this to mongoengine side
        for project in projects:
            # we got back a dict so base on id
            # TODO this should be a function from ProjectPost now a low level DB call
            project_posts = ProjectPost.objects( project = project['id'], parent_id = None )
            for post in project_posts:
                posts.append(post)


        def postCompare(a, b):
            # swap b and a for newest first
            return cmp(b.created_at, a.created_at)

        posts.sort(postCompare)
        return db_list_to_dict_list(posts[0:max_posts], depth=5, recursive=True)

    else:
        # TODO this should be a function from ProjectPost now a low level DB call
        posts = ProjectPost.objects( project = project_id ).limit(max_posts)

        return db_list_to_dict_list(posts)


@stream_api.route('/')
@login_required
def api_stream():
    """
        View to return a jsonified list of posts for a user, based on the
        projects they are joined to
    
        Args: None
        Returns: Jsonified list of project posts, for projects the user is involved with
    """
    streamList = _get_user_stream(g.user.id)
    return jsonify_response(ReturnStructure(data=streamList))
