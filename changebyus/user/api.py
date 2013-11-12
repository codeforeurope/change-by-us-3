# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, request, render_template, redirect, current_app, url_for, request, g
import os

from flask.ext.login import login_required, current_user, login_user
from flask.ext.security.utils import encrypt_password
from flask.ext.cdn_rackspace import upload_rackspace_image


from .models import User
from .helpers import _create_user
from ..helpers.stringtools import bool_strings

from flask.ext.wtf import ( Form, TextField, TextAreaField, FileField, 
                            SubmitField, Required, ValidationError, 
                            PasswordField,  )

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

class CreateUserForm(Form):

    email = TextField("email", validators=[Required()])
    password = PasswordField("password", validators=[Required()])
    display_name = TextField("display_name", validators=[Required()])
    first_name = TextField("first_name", validators=[Required()])
    last_name = TextField("last_name", validators=[Required()])


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

    form = CreateUserForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    email = request.form.get('email')
    password = request.form.get('password')
    display_name = request.form.get('display_name')
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')

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
        return jsonify_response( ReturnStructure(msg = errStr, success = False) )  

    u = _create_user(email=email,
                     password=password,
                     display_name=display_name,
                     first_name=first_name,
                     last_name=last_name)

    login_user(u)

    # if the user signed up from a page of importance, such as a project page
    # then send them back to where they came from
    return jsonify_response( ReturnStructure( data = u.as_dict() ))


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
     
    if u is None:
        ret = ReturnStructure( msg = "User not found.",
                               success = False,
                               data = {} )

        return jsonify_response( ret )

    ret = ReturnStructure( data = u.as_dict() )

    # Remove email from visibility
    if not u.public_email:
        if ret.data.has_key('email'):

            del ret.data['email']

    return jsonify_response( ret )


class EditUserForm(Form):

    email = TextField("email")
    public_email = TextField("public_email")
    password = PasswordField("password")
    display_name = TextField("display_name")
    first_name = TextField("first_name")
    last_name = TextField("last_name")

@user_api.route('/edit', methods = ['POST'])
@login_required
def api_edit_user():
    """
    ABOUT
        Routine to edit a user record
    METHOD
        POST
    INPUT
        OPTIONAL: photo, email, public_email, password, display_name, first_name, last_name
    OUTPUT
        User record upon success
    PRECONDITIONS
        API key exists in the config file
    """

    form = EditUserForm()
    if not form.validate():
        errStr = "Request contained errors."
        return jsonify_response( ReturnStructure( success = False, 
                                                  msg = errStr ) )

    u = User.objects.with_id(g.user.id)

    public_email = request.form.get('public_email')
    if public_email:
        u.public_email = request.form.get('public_email').lower() in bool_strings

    email = request.form.get('email')
    password = request.form.get('password')
    display_name = request.form.get('display_name')
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')

    if email: u.email = email
    if password: u.password = password
    if display_name: u.display_name = display_name
    if first_name: u.first_name = first_name
    if last_name: u.last_name = last_name


    file_name = None

    # photo is optional
    if 'photo' in request.files:
        photo = request.files.get('photo')

        if len(photo.filename) > 3:

            try:
                result = upload_rackspace_image( photo )

                if result.success:
                    file_name = result.name
                    file_path = result.path
                    image_url = result.url

                    from .models import user_images

                    for manipulator in user_images:

                        manip_image = manipulator.converter(file_path)
                        base, extension = os.path.splitext(file_name)
                        manip_image_name = manipulator.prefix + '.' + base + manipulator.extension

                        if not upload_rackspace_image( manip_image.image, 
                                                       manip_image_name).success:

                            return jsonify_response( ReturnStructure ( success = False ) )
                else:
                    return jsonify_response( ReturnStructure ( success = False ) )

            except Exception as e:
                current_app.logger.exception(e)
                msg = "An error occured."
                return jsonify_response( ReturnStructure( success = False, 
                                                          msg = msg ) )

            file_name = result.name

        else:
            # again, photo optional
            file_name = None

    # we don't store the URL because the URL can change depending on what
    # rackspace container we wish to use
    if file_name:
        u.image_name = file_name


    u.save()


    # defaults to success and 'OK'
    return jsonify_response( ReturnStructure( data = u.as_dict() ) )


@user_api.route('/socialstatus', methods = ['GET'])
@login_required
def api_get_user_social_status():
    """
    ABOUT
        Gets the currently logged in users social connection status
    METHOD
        GET
    INPUT
        None
    OUTPUT
        Dict of { 'facebook' : true/false,
                  'twitter': true/false }
    """

    user = User.objects.with_id(g.user.id)
    data = { 'facebook' : True if user.facebook_id else False,
             'twitter' : True if user.twitter_id else False }

    return jsonify_response( ReturnStructure( data = data ) )    


# TODO WTForms for flagging?

@user_api.route('/<user_id>/flag', methods = ['POST'])
@login_required
def api_flag_user(user_id):
    u = User.objects.with_id(user_id)
    
    u.flags += 1
    u.save()

    return jsonify_response(ReturnStructure())


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

