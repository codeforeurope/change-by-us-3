# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for, g, abort, request

from flask.ext.login import login_required, current_user, logout_user, login_user

from flask.ext.wtf import (Form, TextField, TextAreaField, FileField, PasswordField, 
                           SubmitField, Required, ValidationError)

from ..user.models import User
from ..user.helpers import ( _get_user_by_email, _verify_user_password )
from ..project.api import api_get_projects
from ..helpers.flasktools import ReturnStructure, jsonify_response, as_multidict

frontend_api = Blueprint('frontend_api', __name__)

"""
.. module:: frontend/api

    This api has very base level methods such as /login and /logout
"""


class LoginForm(Form):
    email = TextField("email", validators=[Required()])
    password = PasswordField("password", validators=[Required()])


@frontend_api.route('/login', methods = ['POST'])
def user_login():
    """Logs in a user

        Args:
            email: login email
            password: login password

        Returns:
            Logs in user and returns True, or returns False
    """
    form = LoginForm(request.form or as_multidict(request.json))
    if not form.validate():
        errStr = "Request container errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )
    
    email = form.email.data
    password = form.password.data

    user = _get_user_by_email(email = email)

    if user is None or not _verify_user_password(user = user, password = password):
        return jsonify_response( ReturnStructure( msg = 'Unsuccessful', 
                                                  success = False ) )

    login_user(user)
    
    return jsonify_response( ReturnStructure( ) )


@frontend_api.route('/logout')
def user_logout():
    """Logs out a user

        Note: There is probably a native flask routine for this, making this redundant.
    """
    logout_user();

    return jsonify_response( ReturnStructure() )
