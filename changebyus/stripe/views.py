# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for, g
from flask import current_app, request, session, abort
from flask.ext.login import login_required, current_user, login_user

from ..helpers import gen_blank_ok

from .api import _capture_event_details, _get_account_balance_percentage
from .models import StripeAccount, StripeDonation, StripeLink
from ..user.models import User

from flask import current_app, session

import yaml
import os
import inspect
import requests
import urllib
import stripe


stripe_view = Blueprint('stripe_view', __name__, url_prefix='/stripe')

"""
=========================
Stripe Views
=========================

Url visible stripe routines.  For more details on how we do stripe
read the introduction in the api file.

In this file we deal with the Stripe OAuth, which is 2.0 not 1.0.
For that reason we don't rely on the Flask-OAuth, which appears to 
be much more geared towards OAuth 1.0

This file is more or less independent, but in some functions we 
import information on Projects, since Stripe accounts and Projects
are pretty closely linked in CBU.
"""

root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
settings = yaml.load(file(root_directory + '/config/stripe.yml'))

# TODO move to config?
SITE = 'https://connect.stripe.com'
AUTHORIZE_URI = '/oauth/authorize'
TOKEN_URI = '/oauth/token'


@stripe_view.route('/link', methods=['POST'])
@login_required
def stripe_link():
    """
    ABOUT
        Routine to link a stripe account to a project
    METHOD
        POST
    INPUT
        project_id, project_name
    OUTPUT: 
        Redirects user to the Stripe oauth url
    PRECONDITIONS: 
        User is logged in, logged in user owns the project in question
    """

    from ..project.api import _check_user_owns_project

    project_id = request.form['project_id']
    project_name = request.form['project_name']

    if not _check_user_owns_project(user_id=g.user.id,
                                    project_id=project_id):
        warnStr = "User {0} tried to link stripe account to project {1} without being owner".format(g.user.id, project_id)
        current_app.logger.warning(warnStr)
        abort(401)

    # store this information in the session so we have it upon oauth callback
    session['stripe_project_id'] = project_id
    session['stripe_project_name'] = project_name

    site = SITE + AUTHORIZE_URI

    project_url = url_for('project_view.project_view_id', 
                          id = project_id,
                          _external = True)

    # pre-populate a few of the fields
    email = g.user.email
    # the sole_prop pre-populate is important because otherwise the user
    # is asked to provide their EIN, which can confuse people for sure
    biz_type = 'sole_prop'
    first_name = g.user.first_name
    last_name = g.user.last_name


    params = {
             'response_type': 'code',
             'scope': 'read_write',
             'client_id': settings['CLIENT_ID'],
             'stripe_user[url]': project_url,
             'stripe_user[email]': email,
             'stripe_user[business_type]': biz_type,
             'stripe_user[first_name]': first_name,
             'stripe_user[last_name]': last_name,
             'stripe_user[business_name]': project_name,
            }

    # Redirect to Stripe /oauth/authorize endpoint
    url = site + '?' + urllib.urlencode(params)
    return redirect(url)


@stripe_view.route(settings['HOOK_URL'], methods=['GET', 'POST'])
def stripe_hook():
    """
    ABOUT
        Provides a callback url for Stripe to hit when there is account activity
        information available.  We use a URL based on the settings to allow
        each app to customize their URL, security through obscurity.
        
        Read the Api documentation on _capture_event_details for more details
        on how webhooks fit into this blueprint.
    METHOD
        GET, POST
    INPUT
        id, livemode, type, user_id
    OUTPUT
        blank 200 response to keep Stripe happy
    PRECONDITIONS
        Stripe account has the given URL set as a webhook.  This is not automatic,
        you need to manually configure that within Stripe.com account management
    TODO
        Check if this is a GET or a POST routine from Stripe
    """

    event_id = request.json['id']
    livemode = request.json['livemode']
    event_type = request.json['type']
    user_id = request.json['user_id']

    # If we use webhooks, we can really trust our data, but it's slower to get here
    # if we don't use webhooks, the user experience is a bit better.
    # in an ideal world we would use both, one for ui feeback one to verify.
    if settings['USE_WEBHOOKS']:
        current_app.logger.debug("Received stripe hook: {0}".format(request.json))
    else:
        current_app.logger.debug("Received BUT IGNORING stripe hook: {0}".format(request.json))        

    # Do we act on or thwo away test data?
    if settings['SKIP_TESTS'] and livemode == False:
        # TODO log it
        return gen_blank_ok()

    # event types at
    #   https://stripe.com/docs/api#event_types
    # there are tons of them, but for now we only care about charges
    if event_type != 'charge.succeeded':
        # TODO log this
        return gen_blank_ok()

    if settings['USE_WEBHOOKS']:
        _capture_event_details(event_id=event_id, stripe_user_id=user_id)

    return gen_blank_ok()


@stripe_view.route('/authorized')
@login_required
def stripe_authorized():
    """
    ABOUT
        OAuth 2.0 callback from Stripe that authorizes a user and links their
        stripe account with their project
    METHOD
        Get
    INPUT
        oauth code, from stripe
    OUTPUT
        rendered edit_fundraising template if successful
    PRECONDITIONS
        User is logged in, user owns the project in question,
        the project information has been temporarily stored in the user session.
        ie the /link url was hit first
    """

    from ..project.api import _link_stripe_to_project
    from ..project.api import _check_stripe_account_link
    from ..project.api import _check_user_owns_project
    # This is a specific linkage that's per project, so in another
    # project it would import another class

    project_id = session['stripe_project_id']
    project_name = session['stripe_project_name']


    if project_id == None or project_name == None:
        errStr = "Stripe /authorized was called without required session details for user {0}".format(g.user.id)
        current_app.logger.error(errstr)
        abort(401)

    if not _check_user_owns_project(user_id=g.user.id,
                                    project_id=project_id):
        warnStr = "User {0} tried to authorize stripe account to project {1} without being owner".format(g.user.id, project_id)
        current_app.logger.warning(warnStr)
        abort(401)

    code   = request.args.get('code')
    data   = {
             'client_secret': settings['API_SECRET'],
             'grant_type': 'authorization_code',
             'client_id': settings['CLIENT_ID'],
             'code': code
           }

    # Make /oauth/token endpoint POST request
    url = SITE + TOKEN_URI
    resp = requests.post(url, params=data)

    if resp.status_code != 200:
        errStr = "Authorize callback was not 200.  out data: {0}, status_code: {1}, text: {2}".format(data,
                                                                                                      resp.status_code,
                                                                                                      resp.text)
        current_app.logger.error(errStr)
        errStr = "Sorry, strype returned an error.  Please try again."
        return render_template('stripe_error.html', error=errStr)


    # Grab access_token (use this as your user's API key)
    token = resp.json().get('access_token')

    stripe_publishable_key = resp.json().get('stripe_publishable_key')
    access_token = resp.json().get('access_token')
    livemode = resp.json().get('livemode')
    token_type = resp.json().get('token_type')
    scope = resp.json().get('scope')
    refresh_token = resp.json().get('refresh_token')
    stripe_user_id = resp.json().get('stripe_user_id')

    # access token = secret key for user

    linked, linked_name = _check_stripe_account_link(stripe_user_id)


    if linked:
        errStr = "Sorry, stripe account [{0}] is already linked to project {1}.".format(stripe_user_id, linked_name)
        return render_template('stripe_error.html', error=errStr)

    # TODO throw away non-live tokens?

    stripe_accounts = StripeAccount.objects(stripe_user_id=stripe_user_id)
    if stripe_accounts.count() > 0:
        if stripe_accounts.count() > 1:
            errStr = "Error multiple stripe accounts for stripe_user_id {0}".format(stripe_user_id)
            current_app.logger.error(errStr)

        account = stripe_accounts.first()

    else:

        account = StripeAccount(access_token=access_token,
                                stripe_user_id=stripe_user_id,
                                publishable_key=stripe_publishable_key,
                                token_type=token_type,
                                scope=scope,
                                refresh_token=refresh_token,
                                current_amount=0)
        account.save()

    # and now the project link
    if not _link_stripe_to_project(project_id, account.id):
        errStr = "Stripe link for project {0} and stripe account.id {1} failed".format(project_id,
                                                                                       account.id)
        current_app.logger.error(errStr)

    # clear out our variable
    del( session['stripe_project_id'] )
    del( session['stripe_project_name'] )

    infoStr = "Stripe linked stripe account.id {0} to project {1} by user {2}".format(account.id, 
                                                                                      project_id,
                                                                                      g.user.id)
    current_app.logger.info(infoStr)

    return redirect(url_for('project_view.edit_stripe', project_id = project_id, account_id = account.id))


@stripe_view.route('/review', methods = ['POST'])
@login_required
def stripe_review_info():
    """
    ABOUT
        View to let a user view, edit, and confirm the stripe account information
    METHOD
        POST
    INPUT
        stripe account id, funding_goal, description
    OUTPUT
        Rendered fundraising reveiew html
    PRECONDITIONS
        User is logged in
    """
    account_id = request.form['id']
    funding_goal = request.form['goal']
    description = request.form['description']
    balance, percentage = _get_account_balance_percentage(account_id)

    #TODO return API for checking current stripe funding status
    return render_template('fundraise_review.html', funding = funding_goal, description = description, balance = balance, percentage = percentage)


@stripe_view.route('/charge', methods=['POST'])
def charge():
    """
    ABOUT
        Post submission for charging to Stripe
    METHOD
        Post
    INPUT
        stripe access_token, project_id, email, stripeToken, stripe_id
    OUTPUT
        View showing how much was charged,
        StripeDonation database entry is created for charge
    """

    # stripe works in pennies
    amount = int(float(request.form['amount'])*100)

    token = request.form['access_token']

    stripe.api_key = token
    project_id = request.form['project_id']

    customer = stripe.Customer.create(
        email=request.form['email'],
        card=request.form['stripeToken']
    )

    charge = stripe.Charge.create(
        customer=customer.id,
        amount=amount,
        currency='usd',
        description='Flask Charge'
    )
     
    if settings['USE_WEBHOOKS']:
        # this lets us associate a charge to an email address and user when processing
        # via webhooks (callbacks)

        link = StripeLink(email = customer.email,
                          customer_id = customer.id)

        if g.user.is_anonymous() == False:
            link.user = User.objects.with_id(g.user.id)

        link.save()

        infoStr = "StripeLink saved for email {0} and customer id {1}.  Awaiting webhook.".format(email, customer_id)
        current_app.logger.info(infoStr)

    else:

        # if we aren't using webhooks we do this transaction directly
        charge_dict = charge.to_dict()

        if charge_dict['paid'] == False:

            infoStr = "Stripe charge failed. {0}".format(charge_dict)
            current_app.logger.info(infoStr)
            amount = 0

        else:
            stripe_account = StripeAccount.objects.with_id(request.form['stripe_id'])

            if stripe_account == None:
                errStr = "Error locating stripe account for donation.  Stripe Account id {0}".format(stripe_user_id)
                current_app.logger.error(errStr)

                abort(500)

            else:

                # complete the record keeping of the donation

                sd = StripeDonation(amount=float(charge_dict['amount'])/100,
                                    email=request.form['email'],
                                    account=stripe_account)

                if charge_dict['card']['name']:
                    sd.name = charge_dict['card']['name']

                if not g.user.is_anonymous():
                    sd.user = User.objects.with_id(g.user.id)

                sd.save()

                # update the account totals
                stripe_account.current_amount += sd.amount
                stripe_account.save()

                infoStr = "Completed stripe donation of {0} for account {1}".format(sd.amount, stripe_account)
                current_app.logger.info(infoStr)

    return render_template('charge.html', amount=(amount/100), project_id=project_id)
 
