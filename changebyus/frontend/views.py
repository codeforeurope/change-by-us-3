# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for, g, abort, current_app
from flask.ext.login import login_required, current_user, logout_user, login_user

from ..user.models import User
from ..project.api import api_get_projects
from ..helpers import gen_blank_ok

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
        return render_template('index.html', projects = projects, login = True)
    else:
        return render_template('index.html', projects = projects, login = False)   
        

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
    return render_template('signup.html')


@frontend_view.route('/logout')
def user_logout():
    """
    ABOUT
        In retrospect there is probably a native flask-security url that does this...
    TODO
        Check if this can be retired easily
    """
    logout_user();

    return redirect(url_for('frontend_view.home'))
