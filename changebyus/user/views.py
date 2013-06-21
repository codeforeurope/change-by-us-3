# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for
from flask.ext.login import login_required, current_user

from .models import User

user_view = Blueprint('user_view', __name__, url_prefix='/user')

"""
==============
User Views
==============

Web facing user profiles.

"""

@user_view.route('/<display_name>')
@login_required
def user_profile_view(display_name):
    """
    ABOUT
        Renders a user profile page
    METHOD
        Get
    INPUT
        ??       
    OUTPUT
        Rendered user profile page
    PRECONDITIONS
        User is logged in
    """
 
    from ..project.api import _get_user_involved_projects

    user =  User.objects(display_name = display_name)

    if user.count() == 0:
        abort(404)

    if user.count() > 1:
        abort(500)

    first_name = user[0].first_name
    last_name = user[0].last_name
    projects = _get_user_involved_projects(user[0].id)
    email = user[0].email
    public_email = user[0].public_email
    description = user[0].user_description

    return render_template('profile.html', 
        display_name = display_name, 
        first_name=first_name, 
        last_name=last_name,
        projects=projects,
        email=email,
        public_email=public_email,
        description=description
        )
