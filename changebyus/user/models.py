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
from ..helpers import swap_null_id
from ..models_common import EntityMixin

from ..encryption import aes_encrypt, aes_decrypt

"""
=================
User Model File
=================

This is a mongoDB models file that contains models for Users.
This is very straight forward.  The only small catch is that we
have some social keys in these models, which the social tools are 
dependent on

"""


class Role(db.Document, RoleMixin):
    """
    In the future we will have website administrators, multiple project owners,
    etc.  These roles will let us identify who has what permission, and this
    should eventually allow us to do permission checks using @decorators
    rather than the in function checks we do now.
    """
    name = db.StringField(max_length=80, unique=True)
    description = db.StringField(max_length=255)


class User(db.Document, UserMixin, EntityMixin):
    """
    This contains all there is to know about one of our users.
    Passwords are encrypted on save, and additionally we encrypt
    social tokens just to be secure.
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
    roles = db.ListField(db.ReferenceField(Role), default=[])
    
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

    def as_dict(self):
        return {'id': str(self.id),
                'email': self.email,
                'public_email': self.public_email,
                'display_name': self.display_name,
                'first_name': self.first_name,
                'last_name': self.last_name,
                'user_description': self.user_description}
                
    @classmethod    
    def pre_save(cls, sender, document, **kwargs):
        EntityMixin.pre_save(sender, document)
        
        if document.is_new():
            document.password = encrypt_password(document.password)

            if current_app.config['ENCRYPTION']['ENABLED']:

                document.twitter_token = aes_encrypt(document.twitter_token, 
                                                     current_app.config['ENCRYPTION']['KEY'], 
                                                     current_app.config['ENCRYPTION']['IV'])

                document.twitter_token_secret = aes_encrypt(document.twitter_token_secret, 
                                                            current_app.config['ENCRYPTION']['KEY'], 
                                                            current_app.config['ENCRYPTION']['IV'])

                document.facebook_token = aes_encrypt(document.facebook_token, 
                                                      current_app.config['ENCRYPTION']['KEY'], 
                                                      current_app.config['ENCRYPTION']['IV'])
            

        elif document.__dict__.has_key('_changed_fields'):

            if current_app.config['ENCRYPTION']['ENABLED']:

                if 'twitter_token' in document.__dict__['_changed_fields']:
                    document.twitter_token = aes_encrypt(document.twitter_token, 
                                                         current_app.config['ENCRYPTION']['KEY'], 
                                                         current_app.config['ENCRYPTION']['IV'])

                if 'twitter_token_secret' in document.__dict__['_changed_fields']:
                    document.twitter_token_secret = aes_encrypt(document.twitter_token_secret, 
                                                                current_app.config['ENCRYPTION']['KEY'], 
                                                                current_app.config['ENCRYPTION']['IV'])

                if 'facebook_token' in document.__dict__['_changed_fields']:
                    document.facebook_token = aes_encrypt(document.facebook_token, 
                                                          current_app.config['ENCRYPTION']['KEY'], 
                                                          current_app.config['ENCRYPTION']['IV'])
                

    @classmethod    
    def post_init(cls, sender, document, **kwargs):
        
        if current_app.config['ENCRYPTION']['ENABLED']:

            # only decrypt saved documents
            if document.id is not None:
                    
                document.twitter_token = aes_decrypt(document.twitter_token, 
                                                     current_app.config['ENCRYPTION']['KEY'], 
                                                     current_app.config['ENCRYPTION']['IV'])

                document.twitter_token_secret = aes_decrypt(document.twitter_token_secret, 
                                                            current_app.config['ENCRYPTION']['KEY'], 
                                                            current_app.config['ENCRYPTION']['IV'])

                document.facebook_token = aes_decrypt(document.facebook_token, 
                                                      current_app.config['ENCRYPTION']['KEY'], 
                                                      current_app.config['ENCRYPTION']['IV'])



signals.post_init.connect(User.post_init, sender=User)
signals.pre_save.connect(User.pre_save, sender=User)
"""
These signal methods help us encrypt and decrypt the sensitive data
"""

