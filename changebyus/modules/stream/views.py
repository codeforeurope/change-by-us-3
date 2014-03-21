# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
import os
from flask import Blueprint, request, render_template, current_app, redirect, url_for, g
from flask.ext.login import login_required, current_user

from .api import _get_user_stream

from changebyus.modules.facebook.facebook import _get_fb_user_name_and_thumbnail
from changebyus.modules.frontend.views import _return_index
from changebyus.modules.project.helpers import _get_user_involved_projects, _get_project_users_and_common_projects
from changebyus.modules.stripe.api import _get_account_balance_percentage
from changebyus.modules.twitter.twitter import _get_user_name_and_thumbnail

stream_view = Blueprint('stream_view', __name__, url_prefix='/stream')

"""
.. module:: stream/views

	List of views that allow a user to see project posts for a given group of 
	scenarios
"""

@stream_view.route('/')
@login_required 
def projects_view():
    return _return_index()


@stream_view.route('/dashboard')
@login_required 
def dashboard_view():
    return _return_index()
