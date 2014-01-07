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
.. module:: frontend/views

    This views file holds the main landing urls that have no /prefix,
    such as the home page.
"""

@frontend_view.route('/')
def home():
    """Returns home page
    """
    return _return_index()

@frontend_view.route('/signup')
def admin_view():
    """Renders the signup template
    """
    return render_template('index.html')

@frontend_view.route('/admin')
def signup_view():
    """Renders the admin template
    """
    return render_template('index.html')

@frontend_view.route('/login')
def login_view():
    """Renders login template
    """
    return render_template('index.html');

@frontend_view.route('/discover')
def discover_view():
    return _return_index()

@frontend_view.route('/create/project')
@frontend_view.route('/create/resource')
@login_required
def create_project_view():
    return _return_index()

@frontend_view.route('/user/<user_id>')
def user_view(user_id): 
    return _return_index()

@frontend_view.route('/resource/<resource_id>')
def resource_view(resource_id): 
    return _return_index()

@frontend_view.route('/city/<city_id>')
def city_view(city_id): 
    return _return_index()

@frontend_view.route('/social_redirect/<url>')
def social_redirect_view(url=None): 
    return render_template('social_redirect.html', url = url)


def _return_index():
    projects = api_get_projects()
    if g.user.is_anonymous():
        return render_template('index.html', projects = projects, index = True, login = True)
    else:
        user = User.objects.with_id(g.user.id)
        udict = user.as_dict()
        
        keys_to_include = ['image_url_round_medium', 'image_url_round_small']
        udata = {x:udict[x] for x in keys_to_include}

        return render_template('index.html', projects = projects, 
                                             udata = udata,
                                             index = True, 
                                             login = False)   
        
     