# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from datetime import datetime
from flask.ext.security import UserMixin, RoleMixin
from flask.ext.security.utils import encrypt_password
from mongoengine import signals
from flask import current_app

from ..extensions import db

from ..helpers.mixin import ( handle_decryption, handle_initial_encryption,
                              handle_update_encryption, EntityMixin, encode_model )

"""
=================
User Model File
=================

This is a mongoDB models file that contains models for Users.
This is very straight forward.  The only small catch is that we
have some social keys in these models, which the social tools are 
dependent on

"""

# Python 3 allows ENUM's, eventually move to that
class Roles:
    ADMIN = "ADMIN"

class Role(db.EmbeddedDocument):
    """
    This allows us to define user roles, such as "Admin"
    """
    name = db.StringField(max_length=80, unique=True)
    description = db.StringField(max_length=255)


class UserNotifications(db.EmbeddedDocument):
    """
    Lets us keep track of a users notification preferences.
    """

    # joins a project I own or organize
    joins_my_project = db.BooleanField(default = True)
    # update to a project I own or organize
    posts_update_to_my_project = db.BooleanField(default = True)
    # response to an update I created
    responds_to_my_update = db.BooleanField(default = True)
    # response to a update I commented on
    responds_to_my_comment = db.BooleanField(default = True)
    # someone flags my account or project as inappropriate
    flags_me = db.BooleanField(default = True)


    # someone posts a discussion on a project I own or organize
    posts_discussion = db.BooleanField(default = True)
    # someone responds to a discussion on a project I own or organize
    responds_to_a_discussion = db.BooleanField(default = True)

    # someone joins a project I'm involved in (owner, member, organizer)
    joins_common_project = db.BooleanField(default = False)
    # someone posts an update to a project I'm involved in (owner, member, organizer)
    posts_update_common_project = db.BooleanField(default = False)



class User(db.Document, UserMixin, EntityMixin):
    """
    This contains all there is to know about one of our users.
    Passwords are encrypted on save, and additionally we encrypt
    social tokens just to be secure.

    We do not enforce uniqueness in code.  In our case this is 
    because twitter accounts do not provide email, and we also
    allow users to sign up via email w/ no social identity,
    so there is no guarantee for any type of uniqueness in model.
    """

    # global account information, but alas twitter doesn't provide
    # an email so we can't use it as the main user login
    email = db.StringField(max_length=100)
    # allow users to choose whether they want to show their email or not
    public_email = db.BooleanField(default=False)
    
    # basic login information (dependent on email)
    password = db.StringField(max_length=255)
    active = db.BooleanField(default=True)
    confirmed_at = db.DateTimeField()
    roles = db.ListField(db.EmbeddedDocumentField(Role), default=[])
    
    # facebook login information
    facebook_id = db.IntField()
    facebook_token = db.StringField(max_length=400)

    # twitter login information
    twitter_id = db.IntField()
    twitter_token = db.StringField(max_length=400)
    twitter_token_secret = db.StringField(max_length=400)

    # trackable fields
    last_login_at = db.DateTimeField()
    current_login_at = db.DateTimeField()
    last_login_ip = db.StringField(max_length=15)
    current_login_ip = db.StringField(max_length=15)
    login_count = db.IntField()
    
    # cbu-specific fields
    display_name = db.StringField(max_length=50)
    first_name = db.StringField(max_length=20)
    last_name = db.StringField(max_length=20)

    #visible profile information
    user_description = db.StringField(max_length=600)

    notifications = db.EmbeddedDocumentField( UserNotifications )

    # TODO add the user contact preferences

    # fields that will not be returned by the as_dict routine 
    PRIVATE_FIELDS = [
    'password',
    'facebook_token',
    'facebook_id',
    'twitter_id',
    'twitter_token',
    'twitter_token_secret',
    'last_login_ip',
    'current_login_ip',
    ]

    # list of fields we want encrypted by our encryption tool.
    # this should not be the standard method of password encryption.
    ENCRYPTED_FIELDS = [
    'twitter_token',
    'twitter_token_secret',
    'facebook_token'
    ]
      
    # we override the as_dict to handle the email logic
    def as_dict(self, exclude_nulls=True, recursive=False, depth=1, **kwargs ):
        resp = encode_model(self, exclude_nulls, recursive, depth, **kwargs)
        if not self['public_email']:
            resp['email'] = None

        return resp

    @classmethod    
    def pre_save(cls, sender, document, **kwargs):
        EntityMixin.pre_save(sender, document)
        
        if document.is_new():
            document.password = encrypt_password(document.password)
            handle_initial_encryption(document, document.ENCRYPTED_FIELDS)

        elif document.__dict__.has_key('_changed_fields'):
            handle_update_encryption(document, document.ENCRYPTED_FIELDS)

    @classmethod    
    def post_init(cls, sender, document, **kwargs):
        handle_decryption(document, document.ENCRYPTED_FIELDS)


signals.post_init.connect(User.post_init, sender=User)
signals.pre_save.connect(User.pre_save, sender=User)
"""
These signal methods help us encrypt and decrypt the sensitive data
"""

