# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, request, render_template, redirect, url_for, request, g
from flask.ext.login import login_required, current_user, login_user
from flask.ext.security.utils import encrypt_password

from .models import User
from .helpers import *

from ..helpers.flasktools import jsonify_response, ReturnStructure
from ..helpers.mongotools import db_list_to_dict_list 

user_api = Blueprint('user_api', __name__, url_prefix='/api/user')

"""
=========
User API
=========

Users and projects are the core components of CBU.  This user api lets
other modules create/modify/edit user information through various routines.
"""

@user_api.route('/create', methods = ['POST'])
def api_create_user():
    """
    ABOUT
        Method to update users record via Post
    METHOD
        Post
    INPUT
        email, password, display_name, first_name, last_name
    OUTPUT
        Direct user to dashboard if account created or signup if issue
    PRECONDITIONS
        User record doesn't already exist, current viewer is not logged in
    """

    if not g.user.is_anonymous():
        errStr = "You can not create an account when logged in."
        return jsonify_response( ReturnStruct(msg = errStr, success = False) )

    email = get_form('email')
    password = get_form('password')
    display_name = get_form('display_name')
    first_name = get_form('first_name')
    last_name = get_form('last_name')

    errStr = ''
    display_name_user = User.objects(display_name=display_name)
    if display_name_user.count() > 0:
        # TODO display name error
        errStr += "Sorry, user name/display name '{0}' is already in use. ".format(display_name)

    email_user = User.objects(email=email) 
    if email_user.count() > 0:
        # TODO display email error
        errStr += "Sorry, email address '{0}' is already in use.".format(email)

    if len(errStr) > 0:
        return jsonify_response( ReturnStruct(msg = errStr, success = False) )  

    u = _create_user(email=email,
                     password=password,
                     display_name=display_name,
                     first_name=first_name,
                     last_name=last_name)

    login_user(u)

    # if the user signed up from a page of importance, such as a project page
    # then send them back to where they came from
    return jsonify_response( ReturnStruct(msg = "User Created.",
                                          success = True,
                                          data = u.as_dict() ))


@user_api.route('/<id>')    
@login_required
def api_get_user(id):
    """
    ABOUT
        Routine to get a json user object for a given user
    METHOD
        Get
    INPUT
        id
    OUTPUT
        Json user record
    PRECONDITIONS
        The user exists
    """

    u = User.objects.with_id(id)
    
    if u.count() is 0:
        ret = ReturnStructure( msg = "User not found.",
                               success = False,
                               data = {} )

        return jsonify_response( ret )

    else:

        ret = ReturnSctucture( msg = "User found.",
                               success = True,
                               data = u.as_dict() )

        # Remove email from visibility
        if not u.public_email:
            if ret.data.has_key('email'):

                del ret.data['email']

        return jsonify_response( ret )




@user_api.route('/edit', methods = ['POST'])
@login_required
def api_edit_user(id):
    """
    ABOUT
        Routine to edit a user record
    METHOD
        POST
    INPUT
        REQUIRED: id
        OPTIONAL: email, public_email, password, display_name, first_name, last_name
    OUTPUT
        User record upon success
    PRECONDITIONS
        API key exists in the config file
    """

    u = User.objects.with_id(id)
    errMsg = ''

    if( u.count() == 0 ):
        errStr = "Unable to find user with id {0}.".format(id)

    if g.user.id != u.id:
        errStr = "You can only edit the currently logged in user."

    if len(errStr) > 0:
        return jsonify_response( ReturnStructure( success = False, msg = errStr ) )

    email = get_form('email')
    public_email = get_form('public_email')
    password = get_form('password')
    display_name = get_form('display_name')
    first_name = get_form('first_name')
    last_name = get_form('last_name')

    if email: u.email = email
    if public_email: u.public_email = public_email
    if password: u.password = password
    if display_name: u.display_name = display_name
    if first_name: u.first_name = first_name
    if last_name: u.last_name = last_name

    u.save()
    
    # defaults to success and 'OK'
    return jsonify_response( ReturnStructure( data = u.as_dict() ) )



# TODO what is this doing here?
# make sure things work with it commented out
'''
@user_api.route('/encrypt', methods = ['POST', 'GET'])
def api_encrypt():
    """
    A utility API call that encrypts a string using the same algorithm and 
    salt as the application.
    """
    if (request.method == 'POST'):
        s = request.form['string']
    else:
        s = request.args.get('string')
    
    return gen_ok(jsonify({'encrypted': encrypt_password(s)}))
'''

