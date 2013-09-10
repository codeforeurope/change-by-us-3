# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from datetime import datetime
from mongoengine import signals

from ..extensions import db

from ..helpers.mixin import handle_decryption, handle_initial_encryption
from ..helpers.mixin import handle_update_encryption, EntityMixin

from ..user.models import User

from flask import current_app


"""
==============
Stripe Models
==============

In CBU, a Stripe model is both a fundraising drive, and an account
connection to Stripe that is associated with that fundraising drive.
Therefore each account will have a current_amount and goal, along with
information on the stripe credentials.
"""

class StripeAccount(db.Document, EntityMixin):
    """
    StripeAccount, this holds information for the stripe link
    such as the access token, and also holds information
    on the fundraising drive such as the title, description,
    goal, and ammount.
    """

    title = db.StringField(max_length=200)
    description = db.StringField(max_length=500)

    access_token = db.StringField(max_length=200)
    stripe_user_id = db.StringField(max_length=50)

    publishable_key = db.StringField(max_length=50)
    token_type = db.StringField(max_length=20)
    scope  = db.StringField(max_length=20)
    refresh_token = db.StringField(max_length=100)

    goal = db.FloatField(default=0)
    current_amount = db.FloatField(default=0)
    
                
    ENCRYPTED_FIELDS = [
    'access_token'
    ]

    @classmethod    
    def pre_save(cls, sender, document, **kwargs):
        EntityMixin.pre_save(sender, document)
        
        if document.is_new():
            handle_initial_encryption(document, ENCRYPTED_FIELDS)

        elif document.__dict__.has_key('_changed_fields'):
            handle_update_encryption(document, ENCRYPTED_FIELDS)                

    @classmethod    
    def post_init(cls, sender, document, **kwargs):
        handle_decryption(document, ENCRYPTED_FIELDS)



class StripeDonation(db.Document, EntityMixin):
    """
    StripeDonation, this holds information about each 
    individual stripe donation that occurs, including the email
    and if applicable the user who made the donation.
    """
    account = db.ReferenceField(StripeAccount)
    amount = db.FloatField()
    stripe_charge_id = db.StringField(max_length=50)
    name = db.StringField(max_length=50)
    email = db.StringField(max_length=50)
    user = db.ReferenceField(User)


class StripeLink(db.Document, EntityMixin):
    """
    When we use the callback method for storing our transactions,
    we need a way to link the local information (email, user) with
    the stripe transaction when it comes in via the webhook.  This
    class is used for that, using the customer_id to link those
    two together.
    """
    customer_id = db.StringField(max_length=50)
    email = db.StringField(max_length=50)
    # link the donation to a user, if we have such information
    user = db.ReferenceField(User)



signals.post_init.connect(StripeAccount.post_init, sender=StripeAccount)
signals.pre_save.connect(StripeAccount.pre_save, sender=StripeAccount)

signals.pre_save.connect(StripeDonation.pre_save, sender=StripeDonation)

signals.pre_save.connect(StripeLink.pre_save, sender=StripeLink)
"""
The presave routine filles in timestamps for us
The post_init and pre_save routines also help with encryption
"""
