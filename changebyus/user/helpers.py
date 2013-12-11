# -*- coding: utf-8 -*-

from .models import User, UserNotifications
from mongoengine.errors import NotUniqueError

from flask import current_app
from flask.ext.security.utils import ( encrypt_password, verify_password,
                                       verify_and_update_password )

def _get_user_slug_url( user_name=None, user_id = None ):
    # TODO TODO

    return "***** You need to populate this once the user page is made"

def _is_email_in_use(email=None):
    """Simple helper routine to verify if a user has the email address in use already

        Args:
            email: the email in question

        Returns:
            True/False
    """
    if email is None:
        return False

    user = User.objects(email=email)
    if user.count() > 0:
        return True

    return False

def _is_display_name_in_use(display_name=None):
    """Simple helper routine that verifies if a display_name is used or not.

        Args:
            display_name: the display_name in question

        Returns:
            True/False
    """

    if display_name is None:
        return False

    user = User.objects(display_name=display_name)
    if user.count() > 0:
        return True

    return False



def _create_user(email=None, 
                 password=None, 
                 display_name=None, 
                 first_name=None, 
                 last_name=None,
                 bio=None,
                 website=None,
                 location=None,
                 geo_location=None):
    """
        Routine to create a user record. This is purpusly flexible, you can
        create a user with no email, because the user may be identified by their
        social network information.

        Note: If a user has no email address they can not log in via the standard
        login.  This means a Facebook user must use Facebook to log in.

        Note: A password is always needed.  Generate a random one for social users.

        Args:
            email: email for user account
            password: password for user account
            display_name: users display name
            first_name: users first name
            last_name: users last name
            bio: short bio of user
            website: user website
            location: location of user
            geo_location: the geo location of the user

        Returns:
            The new user record if successful, None otherwise

    """

    # we at least need a password
    if password is None:
        return None

    u = User(email=email,
             display_name=display_name,
             first_name=first_name,
             last_name=last_name,
             password=password,
             bio=bio,
             website=website,
             location=location,
             geo_location=geo_location)

    u.notifications = UserNotifications()

    try:
        u.save()
        return u

    except NotUniqueError as e:
        # not really an error per say
        return None

    except Exception as e:

        # Not really an error but logging just in case
        infoStr = "Unable to create user with email {0} and display name {1}.".format(email, display_name)
        current_app.logger.info(infoStr)
        current_app.logger.exception(e)

        return None


def _add_twitter(user_id=None,
                 twitter_id=None,
                 twitter_token=None,
                 twitter_token_secret=None):
    """Method to update users record with twitter information
    
    Args:
        user_id: user id to add the twitter information to
        twitter_id: the twitter id for the user
        twiter_token: the twitter token from oauth
        twitter_token_secret: the twitter secret token from oauth

    Returns:
        True, False
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
    """Method to update users record with twitter information

        Args:
            user_id: user id to add the facebook information to
            facebook_id: facebook id for the user
            facebook_token: facebook token from oauth

        Returns:
            True, False
    """

    user = User.objects.with_id(user_id)
    if user is None:
        current_app.logger.warning("Tried to add facebook credentials to non-existent user {0}".format(user_id))
        return False

    user.facebook_id = facebook_id
    user.facebook_token = facebook_token

    user.save()

    return True


def _get_user_by_email(email=None):
    """Routine to find a user by their email

        Args:
            email: the email address to look up

        Returns:
            User database record

    """

    user = User.objects(email = email)
    if user.count() == 0:
        return None

    if user.count() > 1:
        errStr = "ERROR, email {0} is in the User system twice.".format(email)
        current_app.logger.error(errStr)
        return None

    return user.first()


def _verify_user_password(user=None, password=None):

    if not isinstance(user, User):
        user = User.objects.with_id(user)

    #def verify_password(password, password_hash):
    #return _pwd_context.verify(get_hmac(password), password_hash)

    return verify_and_update_password(password, user)

