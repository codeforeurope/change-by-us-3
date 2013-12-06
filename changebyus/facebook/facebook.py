# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for, g
from flask import current_app, request
from flask.ext.login import login_required, current_user, login_user

from ..user.api import User
from ..user.helpers import _create_user, _add_facebook, _is_email_in_use
from ..helpers.stringtools import string_generator

from flask import current_app, session
from flask_oauth import OAuth

import yaml
import os
import inspect


"""
.. module:: facebook

    :synopsis: Wraps communication with Facebook using Flask-OAuth

    Flask-Oauth is used to do the hard stuff, and then we just wrap the facebook
    api's to allow us to gain access to a users account and then post information.

    This module expects there to be facebook related fields in the User model
    facebook_id = db.IntField()
    facebook_token = db.StringField(max_length=400)

"""


facebook_view = Blueprint('facebook_view', __name__, url_prefix='/social/facebook')

oauth = OAuth()

# some magic that let's us get the local config file
root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
settings = yaml.load(file(root_directory + '/config/facebook.yml'))

# TODO probably should move this into the config file
facebook = oauth.remote_app('facebook',
    base_url='https://graph.facebook.com/',
    request_token_url=None,
    access_token_url='/oauth/access_token',
    authorize_url='https://www.facebook.com/dialog/oauth',
    consumer_key=settings['CONSUMER_KEY'],
    consumer_secret=settings['CONSUMER_SECRET'],
    request_token_params={'scope': 'email,publish_actions'}
)

"""
facebook = oauth.remote_app('facebook',
    base_url='https://graph.facebook.com/',
    request_token_url=None,
    access_token_url='/oauth/access_token',
    authorize_url='https://www.facebook.com/dialog/oauth',
    consumer_key=current_app.settings['FACEBOOK_CONSUMER_KEY'],
    consumer_secret=current_app.settings['FACEBOOK_CONSUMER_SECRET'],
    request_token_params={'scope': 'email,publish_actions'}
)
"""

@facebook.tokengetter
def get_facebook_oauth_token():
    """
        Routine utilized by flask-oauth that will pull a facebook token
        out of the user session, or if the user is authenticated it will
        look for a facebook token in their user record and store it in the
        session

        Args:
            None

        Returns:
            session facebook_token if available
    """
    if session.get('facebook_oauth_token') is None:
        if g.user.is_authenticated():
            if g.user.facebook_token is not None:
                session['facebook_oauth_token'] = (g.user.facebook_token, '')

    return session.get('facebook_oauth_token')
 

# login or create an account using facebook
@facebook_view.route('/login')
def facebook_login():
    """
        View to set up the facebook login callback.  If a user calls
        this routine without an account, it will wind up creating
        an account for them at callback time.

        Args:
            None

        Return:
            Redirects user to facebook oauth process
    """

    # clear out any old facebook data
    if session.has_key('facebook_oauth_token'):
        del session['facebook_oauth_token']

    if g.user.is_authenticated(): 
        return redirect(url_for('frontend_view.social_redirect_view', url='reload'))

    return facebook.authorize(callback=url_for('facebook_view.facebook_authorized',
        next=request.args.get('next') or request.referrer or None,
        _external=True))



# link an existing account using facebook
@facebook_view.route('/link')
@login_required
def facebook_link():
    """
    ABOUT
        view to set up the facebook link callback, linking a facebook
        account to an existing user
    METHOD
        GET
    INPUT
        None
    OUTPUT
        Redirects user to facebook oauth process
    PRECONDITIONS
        None
    """

    # clear out any old facebook data
    if session.has_key('facebook_oauth_token'):
        del session['facebook_oauth_token']

    if g.user.facebook_id is not None:
        infoStr = "User {0} is overwriting their facebook link of old id {1}".format(g.user.id,
                                                                                     g.user.facebook_id)
        current_app.logger.info(infoStr)

    return facebook.authorize(callback=url_for('facebook_view.facebook_authorized',
        next=request.args.get('next') or request.referrer or None,
        _external=True))



@facebook_view.route('/revoke')
@login_required
def facebook_revoke():
    """
        Revoke the application permissiosn on facebook.
        This is very much for debugging and shouldn't be exposed
        to users without a very good reason

        Returns:
            "OK", "FAIL"
    """

    result = facebook.delete('/me/permissions')
    print(dir(result))

    # clear out any old facebook data
    if session.has_key('facebook_oauth_token'):
        del session['facebook_oauth_token']

    if result.status == 200:
        return "OK"
    return "FAIL"


@facebook_view.route('/disconnect')
@login_required
def facebook_disconnect():
    """Removes a facebook linkage from a users account

        Returns:
            Redirect to the dashboard
    """
    infoStr = "Disconnecting user {0} from facebook".format(g.user.id)
    current_app.logger.info(infoStr)
    user = User.objects.with_id(g.user.id)
    user.facebook_id = None
    user.facebook_token = None


    user.save()

    # clear out any old facebook data
    if session.has_key('facebook_oauth_token'):
        del session['facebook_oauth_token']

    return redirect(url_for('stream_view.dashboard_view')+"#profile")

@facebook_view.route('/authorized')
@facebook.authorized_handler
def facebook_authorized(resp):
    """
        Callback url for facebook.  Facebook redirects to this url after
        the user allows or denies permission for our application.

        The same callback is hit if the user is linking or signing in,
        so we do some logic based on the user having an account with the
        facebook_id, and proceed accordingly

        Returns:
            Redirects the user to their dashboard if account was created or logged in,
            Redirects the user to the homepage if they didn't give us permission
            Redirects the user to an error page if their email address is already in use
    """
    if resp is None:
        userStr = 'Unauthenticated'
        if g.user.is_authenticated():
            userStr = g.user.id

        warningStr = "Facebook auth failed on user [{0}], reason {1} description {2}".format(userStr,
                                                                                             request.args['error_reason'],
                                                                                             request.args['error_description'])
        current_app.logger.warning(warningStr)

        if g.user.is_authenticated():
            # they were trying to link 
            return redirect(url_for('frontend_view.social_redirect_view', url='reload'))
        else:
            # non-registered user
            return redirect(url_for('frontend_view.home'))


    facebook_token = resp['access_token']
    session['facebook_oauth_token'] = (facebook_token, '')
    
    # we call facebook to get some additional information on their account
    me = facebook.get('/me')

    facebook_id = me.data['id']


    # if the user is authenticated just link their account
    if g.user.is_authenticated():

        if _add_facebook(user_id=g.user.id,
                        facebook_id=facebook_id,
                        facebook_token=facebook_token):

            debugStr = "Linked user {0} with facebook id {1}".format(g.user.id, facebook_id)
            current_app.logger.debug(debugStr)
            # or return them to where they were
            return redirect(url_for('frontend_view.social_redirect_view', url='reload'))
        else:

            errStr = "Unable to link user {0} with facebook id {1}".format(g.user.id, facebook_id)
            current_app.logger.error(errStr)
            # or return them to where they were            
            return redirect(url_for('frontend_view.social_redirect_view', url='reload'))

    # otherwise let's make an account given their facebook credentials
    user = [] if facebook_id is None else User.objects(facebook_id = facebook_id)

    if user.count() == 0:

        first_name = me.data['first_name']
        last_name = me.data['last_name']
        full_name = me.data['name']
        email = me.data['email']

        # random pw for security so users can't log in normally
        password = string_generator(10)

        # TODO figure out a better way to handle situations
        # where a social user has a display_name or email that is
        # already in use.  As long as they log in through
        # the same social media each time it's not a huge deal, but it's
        # not fantastic..

        if _is_email_in_use(email):
            errStr = "User tried to link facebook with email {0} but email already used.".format(email)
            return render_template('error.html', error = "Sorry, the email {0} is already in use.".format(email))

        u = _create_user(email=email,
                         password=password,
                         display_name=full_name,
                         first_name=first_name,
                         last_name=last_name)

        _add_facebook(user_id=u.id,
                      facebook_id=facebook_id,
                      facebook_token=facebook_token)

       
        login_user(u)

        # user created account
        return redirect(url_for('frontend_view.social_redirect_view', url='signup#twitter'))

    else:

        if user.count() > 1:
            errStr = "user identified by facebook_id {0} has multiple accounts".format(facebook_id)
            current_app.logger.error(errStr)

        login_user(user.first())

        # user created account or logged in
        return redirect(url_for('frontend_view.social_redirect_view', url=' '))



def _post_user_facebook_feed(link=None,
                             picture=None, 
                             name=None, 
                             caption=None, 
                             description=None):
    """Publishes a post to the current logged in users facebook account

        Arguments:
            link: link post is associated with
            picture: picture (url) that post is associated with
            name: post name
            caption: post caption
            description: post description

        Returns:
            (True, post_id) or (False, error_code)

        Preconditions:
            There is a currently logged in user who has a linked facebook account
    """

    if g.user.is_anonymous():
        # TODO error
        return (False, "User not logged in")

    facebook_id = g.user.facebook_id

    if facebook_id is None:
        return (False, "User not registered on Facebook")

    fb_feed_url = "/" + str(facebook_id) + "/feed"

    post_data = { }

    if link: post_data['link'] = link
    if picture: post_data['picture'] = picture
    if name: post_data['name'] = name
    if caption: post_data['caption'] = caption
    if description: post_data['description'] = description

    val = facebook.post(fb_feed_url, post_data)

    if val.status == 200:
        debugStr = "Successfully posted to facebook for user {0}".format(g.user.id)
        current_app.logger.debug(debugStr)
        return (True, val.data['id'])

    if val.status == 400:
        debugStr = "Facebook OAUTH related error posting for user {0}: {1}".format(g.user.id, 
                                                                                   val.data)
        current_app.logger.debug(debugStr)
        return (False, 400)

    errorStr = "Facebook unknown error posting for user {0}: {1}".format(g.user.id,
                                                                         val.data)
    current_app.logger.error(errorStr)
    return (False, val.status)



def _get_fb_user_name_and_thumbnail():
    """
        Retrieves the user_name and thumbnail url for the logged in user,
        assuming they have a facebook account

        Returns:
            True, full_name, url) or (False, '', '')

        Preconditions:
            Global user is logged in, and has a facebook account
    """

    facebook_id = g.user.facebook_id

    if facebook_id is None:
        return False, '', ''

    req = facebook.get('/me?fields=picture,name')

    if req.status != 200:
        warnStr = "Facebook request failed user {0} status {1} response {2}.".format(g.user.id,
                                                                                     req.status,
                                                                                     req.data)
        current_app.logger.warn(warnStr)
        return False, '', ''


    full_name = req.data['name']
    img = req.data['picture']['data']['url']

    return True, full_name, img





