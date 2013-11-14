# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
import os
from flask import Blueprint, request, render_template, current_app, redirect, url_for, g
from flask.ext.login import login_required, current_user

from .api import _get_user_stream
from ..project.helpers import _get_user_involved_projects, _get_project_users_and_common_projects
from ..stripe.api import _get_account_balance_percentage
from ..twitter.twitter import _get_user_name_and_thumbnail
from ..facebook.facebook import _get_fb_user_name_and_thumbnail

stream_view = Blueprint('stream_view', __name__, url_prefix='/stream')

"""
=============
Stream views
=============

List of views that allow a user to see project posts for a given group of scenarios
"""

@stream_view.route('/')
@login_required
def projects_view():
    """
    ABOUT
        Renders the Stream template, which shows the user what's going down on their
        various projects
    METHOD
        Get
    INPUT
        None
    OUTPUT
        Rendered stream.html view
    PRECONDITIONS
        User is logged in
    """

    """
    projects = _get_user_involved_projects(g.user.id)
    posts = _get_user_stream(g.user.id)
    members = _get_project_users_and_common_projects(None, g.user.id)


    for project in projects:
        if project.has_key('stripe_account') and project['stripe_account'] is not None:
            project['account_id'] = project['stripe_account']['id']
            project['balance'], project['percentage'] = \
                _get_account_balance_percentage(project['account_id'])

            project['access_token'] = project['stripe_account']['access_token']                
            project['account_key'] = project['stripe_account']['publishable_key']
            project['stripe_description'] = project['stripe_account']['description']

    return render_template('stream.html', data = projects, posts = posts, members = members, newPost=False)
    """
 
    if g.user.is_anonymous():
        return render_template('index.html', projects = projects, login = True)
    else:
        return render_template('index.html', projects = projects, login = False)   
     

@stream_view.route('/sort', methods = ['GET'])
@login_required
def projects_view_sorted_get():
    """
    ABOUT
        GET routine that allows a user to directly access a default /sort view
    METHOD
        Get
    INPUT
        None
    OUTPUT
        Rendered stream.html view
    PRECONDITIONS
        User is logged in
    """

    sortby = ''
    projects = _get_user_involved_projects(g.user.id)
    posts = _get_user_stream(g.user.id, sortby)
    members = _get_project_users_and_common_projects(sortby, g.user.id)
    tab = None

    return render_template('stream.html', tab=tab, data = projects, posts = posts, filter = sortby, members = members)


@stream_view.route('/sort', methods = ['POST'])
@login_required
def projects_view_sorted():
    """
    ABOUT
        Renders the Stream template, which shows the user what's going down on their
        various projects. Renders this stream with different types of sorting methods
    METHOD
        Post
    INPUT
        None
    OUTPUT
        Rendered stream.html view
    PRECONDITIONS
        User is logged in
    """
    if request.form['project_id'] != "0":
        sortby = request.form['project_id']
        projects = _get_user_involved_projects(g.user.id)
        posts = _get_user_stream(g.user.id, sortby)
        members = _get_project_users_and_common_projects(sortby, g.user.id)
    if request.form.has_key('tab'):
        tab = request.form['tab']
    else:
        tab = None

    if request.form['project_id'] == "0":
        return redirect(url_for('project_view.create_project_view'))
    else:
        return render_template('stream.html', tab=tab, data = projects, posts = posts, filter = sortby, members = members)


@stream_view.route('/dashboard')
@login_required
def dashboard_view():
    """
    ABOUT
        Renders the dashboard with social information.  More documentation needed.
    METHOD
        Get
    INPUT
        None
    OUTPUT
        Rendered dashboard template
    PRECONDITIONS
        User is logged in
    """
    twitter_info = _get_user_name_and_thumbnail()
    facebook_info = _get_fb_user_name_and_thumbnail()
    twitter_name = twitter_info[1]
    twitter_image = twitter_info[2]
    fb_name = facebook_info[1]
    fb_image = facebook_info[2]

    # return render_template('dashboard.html', t_name=twitter_name, t_image=twitter_image, fb_name=fb_name, fb_image=fb_image)
    if g.user.is_anonymous():
        return render_template('index.html', login = True)
    else:
        return render_template('index.html', login = False)

