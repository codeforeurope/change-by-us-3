# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, request, render_template, redirect, url_for, request, g
from flask.ext.login import login_required, current_user, login_user
from flask.ext.security.utils import encrypt_password

from .models import User
from ..helpers.flasktools import gen_ok, gen_blank_ok, jsonify
from ..helpers.mongotools import db_list_to_dict_list 

user_api = Blueprint('user_api', __name__, url_prefix='/api/user')

"""
=========
User API
=========

Users and projects are the core components of CBU.  This user api lets
other modules create/modify/edit user information through various routines.
"""


def _is_email_in_use(email=None):
    """
    ABOUT
        Routine to check if a given email address is used by a user
    METHOD
        Native Python
    INPUT
        email address
    OUTPUT
        True or False
    PRECONDITIONS
        API key exists in the config file
    """
    if email is None:
        return False

    user = User.objects(email=email)
    if user.count() > 0:
        return True


def _create_user(email=None, 
                 password=None, 
                 display_name=None, 
                 first_name=None, 
                 last_name=None):
    """
    ABOUT
        Routine to create a user record. This is purpusly flexible, you can
        create a user with no log in information, because later on we may add
        social network information as a way to recognize the user.

        We must, however, always have a password so that we don't create a blank
        user with no login or password.

        This routine also won't check if any of the fields are already in use
        such as email display_name, etc.  That's up to the programmer.
    METHOD
        Native Python
    INPUT
        password (required), email(optional), display_name (optional),
        first_name (optional), last_name (optional)
    OUTPUT
        User record.
    """

    # we at least need a password
    if password is None:
        return False

    u = User(password = password)

    if email:
        u.email = email
    if display_name:
        u.display_name = display_name
    if first_name:
        u.first_name = first_name
    if last_name:
        u.last_name = last_name

    u.save()

    return u

@user_api.route('/update', methods = ['POST'])
@login_required
def update_email_route():
    """
    ABOUT
        Route to update users email settings
    METHOD
        Post
    INPUT
        email, public_email
    OUTPUT
        redirect for a stream view
    PRECONDITIONS
        User is logged in
    TODO
        This should be made a pure API and the redirect removed
    """
    email = None if request.form['edit_email'] == '' \
                else request.form['edit_email']

    # The check box is not passed in if it's not selected
    # but for completeness we are checking if the value is 'on'
    # anyway
    if request.form.has_key('edit_public'):
        public_email = request.form['edit_public'].lower() == 'on'
    else:
        public_email = False

    if request.form.has_key('description'):
        edit_user_description = request.form['description']
    else:
        edit_user_description = ''

    _update_email(user_id=g.user.id, email=email, public_email=public_email, description=edit_user_description)

    return redirect(url_for('stream_view.projects_view'))


def _update_email(user_id=None,
                  email=None,
                  public_email=None,
                  description=None):
    """
    ABOUT
        Method to update users email settings
    METHOD
        Native Python
    INPUT
        email, public_email, user_id
    OUTPUT
        True, False
    """

    if user_id is None:
        return False
    if email is None and public_email is None:
        return False

    user = User.objects.with_id(user_id)
    if user is None:
        return False

    if email:
        user.email = email
    if public_email is not None:
        user.public_email = public_email
    if description:
        user.user_description = description


    user.save()

    return True

def _add_twitter(user_id=None,
                 twitter_id=None,
                 twitter_token=None,
                 twitter_token_secret=None):
    """
    ABOUT
        Method to update users record with twitter information
    METHOD
        Native Python
    INPUT
        user_id, twitter_id, twiter_token, twitter_token_secret
    OUTPUT
        True, False
    PRECONDITIONS
        User record exists
    """
    
    user = User.objects.with_id(user_id)
    if user is None:
        current_app.logger.warning("Tried to add twitter credentials to non-existent user {0}".format(user_id))
        return False

    user.twitter_id = twitter_id
    user.twitter_token = twitter_token
    user.twitter_token_secret = twitter_token_secret

    user.save()

    return True

def _add_facebook(user_id=None,
                  facebook_id=None,
                  facebook_token=None):
    """
    ABOUT
        Method to update users record with twitter information
    METHOD
        Native Python
    INPUT
        user_id, twitter_id, twiter_token, twitter_token_secret
    OUTPUT
        True, False
    PRECONDITIONS
        User record exists
    """

    user = User.objects.with_id(user_id)
    if user is None:
        current_app.logger.warning("Tried to add twitter credentials to non-existent user {0}".format(user_id))
        return False

    user.facebook_id = facebook_id
    user.facebook_token = facebook_token

    user.save()

    return True

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
        return render_template('signup.html', error_string=errStr)

    email = request.form['email']
    password = request.form['password']
    display_name = request.form['display_name']
    first_name = request.form['first_name']
    last_name = request.form['last_name']

    errStr = ''
    display_name_user = User.objects(display_name=display_name)
    if display_name_user.count() > 0:
        # TODO display name error
        errStr += "Sorry, user name '{0}' is already use. ".format(display_name)

    email_user = User.objects(email=email) 
    if email_user.count() > 0:
        # TODO display email error
        if len(errStr) > 0:
            errStr += "Sorry, email address '{0}' is already in use.".format(email)
        else:
            errStr += "Email address '{0}' is already in use.".format(email)


    if len(errStr) > 0:
        return render_template('signup.html', error_string=errStr)

    u = _create_user(email=email,
                     password=password,
                     display_name=display_name,
                     first_name=first_name,
                     last_name=last_name)

    login_user(u)

    # if the user signed up from a page of importance, such as a project page
    # then send them back to where they came from
    if request.form.has_key('next'):
        return redirect(request.form['next'])

    return redirect(url_for('stream_view.dashboard_view'))


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
        return gen_blank_ok()

    # don't release their email if they have it private
    if u.public_email == False:
        u.email = ''

    return gen_ok( jsonify( u.as_dict()))



@user_api.route('/<id>/edit', methods = ['POST'])
@login_required
def api_edit_user(id):
    """
    ABOUT
        Routine to edit a user record
    METHOD
        Post
    INPUT
        url: user id
        post: email, password, display_name, first_name, last_name
    OUTPUT
        bit.ly url OR ''
    PRECONDITIONS
        API key exists in the config file
    """

    u = User.objects.with_id(id)

    if g.user.id != id:
        return no_permission("You can not edit other users.")

    email = request.form['email']
    password = request.form['password']
    display_name = request.form['display_name']
    first_name = request.form['first_name']
    last_name = request.form['last_name']

    if email: u.email = email
    if password: u.password = password
    if display_name: u.display_name = display_name
    if first_name: u.first_name = first_name
    if last_name: u.last_name = last_name
    u.save()
    
    return gen_ok( jsonify( u.as_dict()))



# TODO what is this doing here?
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
    

