# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for, g, abort, current_app
from flask.ext.login import login_required, current_user, logout_user, login_user

from ..user.api import api_get_user

from ..user.models import User
from ..project.api import api_get_projects
from ..helpers.flasktools import gen_blank_ok

frontend_view = Blueprint('frontend_view', __name__)

"""
==============
Frontend Views
==============

This views file holds the main landing urls that have no /prefix,
such as the home page.
"""

@frontend_view.route('/')
def home():
    """
    ABOUT
        The homepage
    """
    projects = api_get_projects()
    if g.user.is_anonymous():
        return render_template('index.html', projects = projects, index = True, login = True)
    else:
        return render_template('index.html', projects = projects, index = True, login = False)   
        

@frontend_view.route('/signup')
def signup_view():
    """
    ABOUT
        This allows users to signup to our system and usually people are dropped
        here if they can't login, or if their modal based signeup process fails.
    TODO
        In the future we could better integrate this with the flask-security registration
        process, but due to our integration of social network account creation
        (sign up through twitter, sign up through facebook) we did this our own way
    """
    return render_template('index.html')

@frontend_view.route('/login')
def login_view():
    return render_template('index.html');


@frontend_view.route('/discover')
def discover_view():
    if g.user.is_anonymous():
        return render_template('index.html', login = True)
    else:
        return render_template('index.html', login = False)

@frontend_view.route('/create')
def create_project_view():
    if g.user.is_anonymous():
        return render_template('index.html', login = True)
    else:
        return render_template('index.html', login = False)

@frontend_view.route('/user/<user_id>')
def user_view(user_id): 
    if g.user.is_anonymous():
        return render_template('index.html', login = True)
    else:
        return render_template('index.html', login = False)

@frontend_view.route('/social_redirect/<url>')
def social_redirect_view(url=None): 
    return render_template('social_redirect.html', url = url)
