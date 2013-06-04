# -*- coding: utf-8 -*-
from datetime import datetime
from mongoengine import signals

from ..extensions import db
from ..helpers import swap_null_id
from ..models_common import EntityMixin
from ..user.models import User

from flask import current_app
from ..encryption import aes_encrypt, aes_decrypt

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

    def as_dict(self):
        return {'id': str(self.id),

                'goal': self.goal,
                'current_amount': self.current_amount,
                'access_token': self.access_token,
                'publishable_key': self.publishable_key,
                'description': self.description,
                'percentage': (self.current_amount/self.goal)*100 if self.goal > 0 else 0 }

    @classmethod    
    def pre_save(cls, sender, document, **kwargs):
        EntityMixin.pre_save(sender, document)
        
        if current_app.config['ENCRYPTION']['ENABLED']:

            if document.is_new():
                document.access_token = aes_encrypt(document.access_token, 
                                                    current_app.config['ENCRYPTION']['KEY'], 
                                                    current_app.config['ENCRYPTION']['IV'])        

            elif document.__dict__.has_key('_changed_fields'):
                if 'access_token' in document.__dict__['_changed_fields']:
                    document.access_token = aes_encrypt(document.access_token, 
                                                        current_app.config['ENCRYPTION']['KEY'], 
                                                        current_app.config['ENCRYPTION']['IV'])
                

    @classmethod    
    def post_init(cls, sender, document, **kwargs):

        if current_app.config['ENCRYPTION']['ENABLED']:

            # only decrypt saved documents
            if document.id is not None:
            
                document.access_token = aes_decrypt(document.access_token, 
                                                    current_app.config['ENCRYPTION']['KEY'], 
                                                    current_app.config['ENCRYPTION']['IV'])




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

    def as_dict(self):
        return {'id': str(self.id),
                'account': self.account.as_dict(),
                'name': self.name,
                'email': self.email,
                'user' : self.user.as_dict() if self.user else None,
                'amount': self.amount if self.amount else 0}


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
    user = db.ReferenceField(User)

    def as_dict(self):
        return {'id': str(self.id),
                'customer_id': self.customer_id,
                'email': self.email,
                'user': self.user.as_dict() if self.user else None}




signals.post_init.connect(StripeAccount.post_init, sender=StripeAccount)
signals.pre_save.connect(StripeAccount.pre_save, sender=StripeAccount)
signals.pre_save.connect(StripeDonation.pre_save, sender=StripeDonation)
signals.pre_save.connect(StripeLink.pre_save, sender=StripeLink)
"""
The presave routine filles in timestamps for us
The post_init and pre_save routines also help with encryption
"""
