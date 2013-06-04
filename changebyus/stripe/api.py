# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, redirect, url_for, request, current_app, g
from flask.ext.login import login_required, current_user

from .models import StripeAccount, StripeDonation, StripeLink
from ..helpers import gen_ok, gen_blank_ok, db_list_to_dict_list

import requests
import yaml
import os
import inspect
import requests

root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
settings = yaml.load(file(root_directory + '/config/stripe.yml'))

stripe_api = Blueprint('stripe_api', __name__, url_prefix='/api/stripe')

# TODO move to config?
SITE = 'https://api.stripe.com'
EVENT_URI = '/v1/events'

"""
==========================
Stripe Webservice Wrapper
==========================

Stripe is a payment system that has a nice developer integration.
This blueprint works on the stripe connect API, which allows 
us to code CBU for stripe, and then the different projects can
link their stripe accounts into our master account, allowing them
to receive money while we get access to basic deposit information 
and can keep track of donation amounts.

This module lets users link/unlink stripe accounts from a Project,
but it will always keep historical records.  These records should
also be available in the flask accounts just in case.
"""

def _update_goal_description(stripe_id=None,
                             goal=None,
                             description=None):
    """
    ABOUT
        Updates basic information on a stripe account
    METHOD
        Native Python
    INPUT
        stripe_id (database_id), goal ($$$), description
    OUTPUT: 
        True,False
    PRECONDITIONS: 
        stripe account exists in db
    """
    
    account = StripeAccount.objects.with_id(stripe_id)
    if account is None:
        return False

    account.goal = float(goal)
    account.description = description
    account.save()

    return True


def _get_account_balance_percentage(stripe_account_id=None):
    """
    ABOUT
        Helper routine that returns the dollar ammount
        of a stripe account (a drive), and what percentage of the
        total goal has been reached
    METHOD
        Native Python
    INPUT
        stripe_id (database_id)
    OUTPUT: 
        current_ammount, percentage
    PRECONDITIONS: 
        API key exists in the config file
    """
    account = StripeAccount.objects.with_id(stripe_account_id)

    if account is None:
        return 0,0

    current_amount = account.current_amount
    goal = account.goal

    # assert False
    if goal == 0:
        return current_amount, 100

    return current_amount, ((current_amount/goal) * 100)


def _capture_event_details(event_id=None, stripe_user_id=None):
    """
    ABOUT
        In short, this routine contacts stripe and gets details on a given
        event, and then saves the new charge to the stripe account.
        More detailed explanation below.

        Stripe works on the idea of webhooks.  The master account
        can receive a webhook any time something happens on the master
        account or one of the linked up sub-accounts.  Our initial approach
        was to wait for a webhook, and then call this routine with the event_id
        and the stripe_user_id.  We would then contact stripe's webservice
        and get information on the transaction.

        The benefit of that approach was mainly security.  Not that we
        actually handle the transactions, but if we always contacted stripe
        for details of a transaction we knew it was authentic.  The problem
        became that webhooks had a long enough delay (a few seconds), that users
        wouldn't see their transactions immediately.  Additionally there was
        a delay in a webhook propogating to a newly linked account, so a user
        would set up their stripe account, test it, and not see the transaction
        come through.  For that reason we moved more towards collecting
        information directly from the stripe transaction, but with that
        said this routine still works just fine.
    METHOD
        Native Python
    INPUT
        event_id, and stripe_user_id
    OUTPUT: 
        True, False
    PRECONDITIONS: 
        stripe_user_id belongs to a stripe account in our database
    """
    accounts = StripeAccount.objects(stripe_user_id=stripe_user_id)
    if accounts.count() == 0:
        errStr = "Received stripe webhook for an unknown account {0}, event_id {1}".format(stripe_user_id,
                                                                                           event_id)
        current_app.logger.error(errStr)
        return False

    account = accounts.first()
    access_token = account.access_token

    url = SITE + EVENT_URI + '/' + event_id
    
    s = requests.Session()
    s.auth = (access_token, '')
    response = s.get(url)

    data = response.json()

    charge_livemode = data['livemode']
    charge_event_type = data['type']
    charge_id = data['data']['object']['id']
    charge_amount = float(data['data']['object']['amount']) / 100.0

    # CHECK EVENT TYPE

    donation = StripeDonation(account=account,
                              amount=charge_amount,
                              stripe_charge_id=charge_id)

    try:
        donation.name = data['data']['object']['card']['name']
    except Exception:
        pass

    try:
        link = StripeLink.objects(customer_id = data['data']['object']['customer'])
        if len(link == 0):
            errStr = "Tried to capture event details with no StripeLink record, stripe_user_id {0} event id {1}".format(stripe_user_id,
                                                                                                                        event_id)
            current_app.logger.error(errStr)

        donation.email = link.first().email
        donation.user = link.first().user
    except Exception as e:
        errStr = "Appears an incomplete stripe event was returned.  Data {0} Exception {1}".format(data, str(e))
        current_app.logger.error(errStr)
        
    donation.save()

    current_app.logger.info("Adding {0} to StripeAccount {1}".format(charge_amount, 
                                                                     account.id))
    account.current_amount += charge_amount
    account.save()

    infoStr = "Successfully pulled details on stripe event id {0}".format(event_id)
    current_app.logger.info(infoStr)

    return True


    

