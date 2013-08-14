# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import ( Blueprint, render_template, redirect, url_for, g, abort, 
                    current_app, request )

from flask.ext.login import login_required, current_user, logout_user, login_user

from flask.ext.wtf import (Form, TextField, TextAreaField, FileField, PasswordField, 
                           SubmitField, Required, ValidationError)


from ..user.models import User
from ..user.helpers import ( _get_user_by_email, _verify_user_password )
from ..project.api import api_get_projects
from ..helpers.flasktools import ReturnStructure, jsonify_response

frontend_api = Blueprint('frontend_api', __name__)

"""
==============
Frontend Api
==============

This api has very base level methods such as /login and /logout
"""


class LoginForm(Form):
    email = TextField("email", validators=[Required()])
    password = PasswordField("password", validators=[Required()])

@frontend_api.route('/login', methods = ['POST'])
def user_login():

    form = LoginForm()
    if not form.validate():
        errStr = "Request container errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )
    
    email = request.form.get('email')
    password = request.form.get('password')

    user = _get_user_by_email(email = email)

    if user is None or not _verify_user_password(user = user, password = password):
        return jsonify_response( ReturnStructure( msg = 'Unsuccessful', 
                                                  success = False ) )

    login_user(user)
    
    return jsonify_response( ReturnStructure( ) )



@frontend_api.route('/logout')
def user_logout():
    """
    ABOUT
        In retrospect there is probably a native flask-security url that does this...
    TODO
        Check if this can be retired easily
    """
    logout_user();

    return jsonify_response( ReturnStructure() )
