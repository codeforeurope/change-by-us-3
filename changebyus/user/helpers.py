# -*- coding: utf-8 -*-

from .models import User

from flask import current_app
from flask.ext.security.utils import ( encrypt_password, verify_password,
                                       verify_and_update_password )

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

        WARNING: This routine also won't check if any of the fields are already 
        in use such as email display_name, etc.  That's up to the programmer.

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


def _get_user_by_email(email=None):

    user = User.objects(email = email)
    if user.count() == 0:
        return None

    if user.count() > 1:
        errStr = "ERROR, email {0} is in the User system twice.".format(email)
        current_app.logger.error(errStr)
        return None

    return user[0]

def _verify_user_password(user=None, password=None):

    if not isinstance(user, User):
        user = User.objects.with_id(user)

    #def verify_password(password, password_hash):
    #return _pwd_context.verify(get_hmac(password), password_hash)

    return verify_and_update_password(password, user)

