# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for, g
from flask import current_app, request
from flask.ext.login import login_required, current_user, login_user

from ..user.models import User
from ..user.api import _create_user, _add_twitter
from ..helpers.stringtools import string_generator

from flask import current_app, session
from flask_oauth import OAuth

import yaml
import os
import inspect

from datetime import datetime
from pprint import pprint

twitter_view = Blueprint('twitter_view', __name__, url_prefix='/social/twitter')

"""
===============
Twitter Tools
===============
A set of tools for interacting with twitter, built ontop of flask-oauth
--------------------------------------------------------------------------

Flask-Oauth is used to do the hard stuff, and then we just wrap the twitter
api's to allow us to gain access to a users account and then post information.

This module expects there to be twitter related fields in the User model
    twitter_id = db.IntField()
    twitter_token = db.StringField(max_length=400)
    twitter_token_secret = db.StringField(max_length=400)

What would be better is finding a way to dynamically add this information to 
the model if it doesn't exist, but who knows.
"""


oauth = OAuth()

root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
settings = yaml.load(file(root_directory + '/config/twitter.yml'))

POST_URI = '/1.1/statuses/update.json'

# Use Twitter as example remote application
twitter = oauth.remote_app('twitter',
    # unless absolute urls are used to make requests, this will be added
    # before all URLs.  This is also true for request_token_url and others.
    base_url='https://api.twitter.com/',
    # where flask should look for new request tokens
    request_token_url='https://api.twitter.com/oauth/request_token',
    # where flask should exchange the token with the remote application
    access_token_url='https://api.twitter.com/oauth/access_token',
    # twitter knows two authorizatiom URLs.  /authorize and /authenticate.
    # they mostly work the same, but for sign on /authenticate is
    # expected because this will give the user a slightly different
    # user interface on the twitter side.
    authorize_url='https://api.twitter.com/oauth/authorize',
    # the consumer keys from the twitter application registry.
    consumer_key=settings['CONSUMER_KEY'],
    consumer_secret=settings['CONSUMER_SECRET'],
)


@twitter.tokengetter
def get_twitter_oauth_token():
    """
    ABOUT
        Routine utilized by flask-oauth that will pull a twitter token
        out of the user session, or if the user is authenticated it will
        look for a twitter token in their user record and store it in the
        session
    METHOD
        Native Python
    INPUT
        None
    OUTPUT
        session['twitter_oauth_tokens'] set with (g.user.twitter_token, g.user.twitter_token_secret), if available
    PRECONDITIONS
        None
    """
    if session.get('twitter_oauth_tokens') is None:
        if g.user.is_authenticated():
            if g.user.twitter_token_secret is not None and g.user.twitter_token is not None:
                session['twitter_oauth_tokens'] = (g.user.twitter_token, g.user.twitter_token_secret)

    return session.get('twitter_oauth_tokens')
    

@twitter_view.route('/login')
def twitter_login():
    """
    ABOUT
        View to set up the twitter login callback.  If a user calls
        this routine without a CBU account, it will wind up creating
        an account for them at callback time.
    METHOD
        GET
    INPUT
        None
    OUTPUT
        Redirects user to twitter oauth process
    PRECONDITIONS
        None
    """

    # clear out any old twitter data
    if session.has_key('twitter_oauth_tokens'):
        del session['twitter_oauth_tokens']

    if g.user.is_authenticated():
        return redirect(url_for('stream_view.dashboard_view'))

    return twitter.authorize(callback=url_for('twitter_view.twitter_authorized',
        next=request.args.get('next') or request.referrer or None,
        _external=True))


@twitter_view.route('/link')
@login_required
def twitter_link():
    """
    ABOUT
        view to set up the twitter link callback, linking a twitter
        account to an existing user
    METHOD
        GET
    INPUT
        None
    OUTPUT
        Redirects user to twitter oauth process
    PRECONDITIONS
        None
    """

    # clear out any old twitter data
    if session.has_key('twitter_oauth_tokens'):
        del session['twitter_oauth_tokens']

    if g.user.twitter_id is not None:
        infoStr = "User {0} is overwriting their twitter link of old id {1}".format(g.user.id,
                                                                                     g.user.twitter_id)
        current_app.logger.info(infoStr)

    return twitter.authorize(callback=url_for('twitter_view.twitter_authorized',
        next=request.args.get('next') or request.referrer or None,
        _external=True))


@twitter_view.route('/disconnect')
@login_required
def twitter_disconnect():
    """
    ABOUT
        Removes a twitter linkage from a users account
    METHOD
        GET
    INPUT
        None
    OUTPUT
        Redirect to the dashboard
    PRECONDITIONS
        User logged in
    TODO
        This routine should be a POST since it changes states.
        This is, overall, a badly thought out method
    """
    infoStr = "Disconnecting user {0} from twitter".format(g.user.id)
    current_app.logger.info(infoStr)
    user = User.objects.with_id(g.user.id)
    user.twitter_id = None
    user.twitter_token = None
    user.twitter_token_secret = None

    user.save()

    # clear out any old twitter data
    if session.has_key('twitter_oauth_tokens'):
        del session['twitter_oauth_tokens']

    return redirect(url_for('stream_view.dashboard_view'))



@twitter_view.route('/authorized')
@twitter.authorized_handler
def twitter_authorized(resp):
    """
    ABOUT
        Callback url for twitter.  Twitter redirects to this url after
        the user allows or denies permission for our application.

        The same callback is hit if the user is linking or signing in,
        so we do some logic based on the user having an account with the
        twitter_id, and proceed accordingly
    METHOD
        Get
    INPUT
        oauth twitter access_token
    OUTPUT
        Redirects the user to their dashboard if account was created or logged in,
        Redirects the user to the homepage if they didn't give us permission
        Redirects the user to an error page if their email address is already in use
    PRECONDITIONS
        None
    TODO
        The twitter oauth workflow is buggy.  About 50% of the time flask-oauth
        rejects the twitter callback, even though the callback comes through as
        if everything is fine.  This needs to be looked into.  Generally we notice
        it on accounts that have been linked to twitter multiple times (ie testing),
        but it shows up on regular work as well
    """
    if resp is None:
        userStr = 'Unauthenticated'
        if g.user.is_authenticated():
            userStr = g.user.id

        warningStr = "Twitter auth failed on user [{0}]".format(userStr)
        current_app.logger.warning(warningStr)

        if g.user.is_authenticated():
            # they were trying to link
            return redirect(url_for('stream_view.dashboard_view'))
        else:
            # non-registered user
            return redirect(url_for('frontend_view.home'))

    oauth_token = resp['oauth_token']
    oauth_token_secret = resp['oauth_token_secret']
    twitter_id = resp['user_id']
    screen_name = resp['screen_name']

    session['twitter_oauth_tokens'] = oauth_token, oauth_token_secret

    req2 = twitter.get('/1.1/users/show.json?user_id='+str(twitter_id))
    name = req2.data['name']

    first_name = ''
    last_name = ''
    space_index = name.rfind(' ')

    if space_index != -1:
        first_name = name[:space_index]
        last_name = name[space_index+1:]
    else:
        last_name = name


    # if the user is authenticated just link their account
    if g.user.is_authenticated():

        if _add_twitter(user_id=g.user.id,
                       twitter_id=twitter_id,
                       twitter_token=oauth_token,
                       twitter_token_secret=oauth_token_secret):

            debugStr = "Linked user {0} with twitter id {1}".format(g.user.id, twitter_id)
            current_app.logger.debug(debugStr)
            # or wherever they were originally from
            return redirect(url_for('stream_view.dashboard_view'))

        else:

            errStr = "Unable to link user {0} with twitter id {1}".format(g.user.id, twitter_id)
            # or wherever they were originally from
            current_app.logger.error(errStr)

        return redirect(url_for('stream_view.dashboard_view'))


    # otherwise let's make an account given their twitter account
    user = [] if twitter_id is None else User.objects(twitter_id = twitter_id)

    if user.count() == 0:

        # random pw for security so users can't log in normally
        password = string_generator(10)


        # TODO figure out a better way to handle situations
        # where a social user has a display_name or email that is
        # already in use.  As long as they log in through
        # the same social media each time it's not a huge deal, but it's
        # not fantastic..

        # TODO let user adjust account
        u = _create_user(email=None,
                         password=password,
                         display_name=screen_name,
                         first_name=first_name,
                         last_name=last_name)

        _add_twitter(user_id=u.id,
                     twitter_id=twitter_id,
                     twitter_token=oauth_token,
                     twitter_token_secret=oauth_token_secret)

        login_user(u)

    else:

        if user.count() > 1:
            errStr = "User identified by twitter_id {0} has multiple accounts.".format(twitter_id)
            current_app.logger.error(errStr)

        login_user(user.first())

    # user created account or logged in
    return redirect(url_for('frontend_view.home'))


# status max 140, will truncate
def _post_user_twitter_update(status=None):
    """
    ABOUT
        Publishes a tweet to the current logged in users twitter account
    METHOD
        Native Python
    INPUT
        status
    OUTPUT
        (True, post_id, 0, success) or (False, error_code, sub_code, error_message).
        Note that an error_code of 403 and a sub_code of 187 means it failed due to
        a duplicate posting
    PRECONDITIONS
        There is a currently logged in user who has a linked twitter account
    """
    resp = twitter.post(POST_URI, data={ 'status': status[:140] })

    if resp.status == 200:
        debugStr = "Successfully posted to twitter for user {0}".format(g.user.id)
        current_app.logger.debug(debugStr)
        return (True, resp.data['id'], 0, "Success")

    if resp.status == 403 and resp.data['errors'][0]['code'] == 187:
        debugStr = "Twitter duplicate related error posting for user {0}: {1}".format(g.user.id, 
                                                                                      val.data)
        return (False, 403, resp.data['errors'][0]['code'], resp.data['errors'][0]['message'])

    errorStr = "Twitter generak error posting for user {0}: {1}".format(g.user.id,
                                                                         val.data)
    current_app.logger.error(errorStr)
    return (False, 403, resp.data['code'], resp.data['errors'][0]['message'])


# requires user to be logged in
def _get_user_name_and_thumbnail():
    """
    ABOUT
        Retrieves the user_name and thumbnail url for the logged in user,
        assuming they have a twitter account
    METHOD
        Native Python
    INPUT
        None
    OUTPUT
        (True, full_name, url) or (False, '', '')
    PRECONDITIONS
        Global user is logged in, and has a twitter account
    """

    twitter_id = g.user.twitter_id

    if twitter_id is None:
        return False, '', ''

    req = twitter.get('/1.1/users/show.json?user_id='+str(twitter_id))

    if req.status != 200:
        warnStr = "Twitter request failed user {0} status {1} response {2}.".format(g.user.id,
                                                                                    req.status,
                                                                                    req.data)
        current_app.logger.warn(warnStr)
        return False, '', ''

    name = req.data['screen_name']
    img = req.data['profile_image_url_https']

    return True, name, img





