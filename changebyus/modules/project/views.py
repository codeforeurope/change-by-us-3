# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import (Blueprint, request, render_template, redirect, 
                  url_for, g, current_app)
from flask.ext.login import login_required, current_user

from mongoengine.errors import ValidationError

from .decorators import project_exists, valid_project_membership
from .models import Project
from .helpers import _user_involved_in_project

from changebyus.modules.stripe.api import _get_account_balance_percentage, _update_goal_description
from changebyus.modules.user.models import User

project_view = Blueprint('project_view', __name__, url_prefix='/project')
 

"""
==============
Project Views
==============

Web facing views for interacting with projects.

"""
@project_view.route('/<project_id>/fundraising')
@project_view.route('/<project_id>/admin')
@project_view.route('/<project_id>')
@project_exists
# @valid_project_membership
def project_view_id(project_id):
    """
    ABOUT:
        View a project for a given id
    METHOD
        Get
    INPUT
        Url
    OUTPUT
        Rendered template of a project.  Either public view or private 
        view, depending on the current user's membership details
    TODO 
        Limit the number of posts shown for the project
    """


    """
    Project is not supposed to know about post, but since a project
    view involves post information, we needed to include this one little
    circular include.  We do our best to contain it only to the function itself
    """

    from ..post.helpers import _get_project_post_stream
    
    try:
        project = Project.objects.with_id(project_id)
        project.count()
    except ValidationError as e:
        # we passed the decorator so let this error drop through
        project = Project.objects(slug=project_id).first()
        # overwrite the slug with the project_id
        project_id = project.id


    if g.user.is_anonymous():
        involved = False
    else:
        involved = _user_involved_in_project(project.id, g.user.id)


    # get the private_data if they are a member
    # TODO limit the number of posts that are returned here
    posts = _get_project_post_stream(project_id=project.id,
                                     private_data=involved)

    data = { 'project' : project.as_dict(),
             'posts' : posts}

    if project.stripe_account is not None:
        account_id = project.stripe_account.id
        balance, percentage = _get_account_balance_percentage(account_id)
        account_key = project.stripe_account.publishable_key
        description = project.stripe_account.description
        access_token = project.stripe_account.access_token

    else:
        account_id, balance, percentage, account_key, description, access_token = None, None, None, None, None, None

    if g.user.is_anonymous():
        return render_template('index.html', 
            project = project.as_dict(), 
            posts = posts, 
            involved = involved, 
            login = True, 
            percentage = percentage, 
            balance = balance, 
            description=description, 
            key=account_key, 
            access_token=access_token,
            account_id=account_id)
    else:
        user = User.objects.with_id(g.user.id)
        udict = user.as_dict()
        
        keys_to_include = ['image_url_round_medium', 'image_url_round_small']
        udata = {x:udict[x] for x in keys_to_include}

        return render_template('index.html', 
            udata = udata,
            project = project.as_dict(), 
            posts = posts, 
            involved = involved, 
            login = False, 
            percentage = percentage, 
            balance=balance, 
            description=description, 
            key=account_key, 
            access_token=access_token,
            account_id=account_id)      
             

@project_view.route('/create')
@login_required
def create_project_view():
    """
    ABOUT
        Renders a create project template
    METHOD
        Get
    INPUT
        None       
    OUTPUT
        Rendered create template project
    PRECONDITIONS
        User is logged in
    """
    return render_template('create_project.html')


@project_view.route('/fundraising', methods = ['POST'])
@login_required
def setup_fundraising():
    """
    ABOUT
        View to render the fundraising template, used to set up fundraising 
        for the project
    METHOD
        POST
    INPUT
        project_id
    OUTPUT
        Rendered template that will allow the user to begin the Stripe 
        authentication and linking process.
    PRECONDITIONS
        User is logged in, user is project owner
    """

    project_id = request.form['project_id']
    project = Project.objects.with_id(project_id)
    
    if g.user.id != project.owner.id:
        warnStr = "User {0} tried to set up fundraising on project {1}".format(g.user.id, project_id)
        current_app.logger.warning(warnStr)
        abort(401)

    project_name=project.name

    return render_template('fundraise.html', project = project_id, name = project_name)


@project_view.route('/<project_id>/stripe/<account_id>/edit')
@login_required
def edit_stripe(project_id=None, account_id=None):
    """
    ABOUT
        View to render the fundraising_edit template, which lets the user
        edit their fundraising details such as money needed.
    METHOD
        Get
    INPUT
        project_id, account_id both via url
    OUTPUT
        Rendered template 
    PRECONDITIONS
        User is logged in
    """

    project = Project.objects.with_id(project_id)
    
    if g.user.id != project.owner.id:
        warnStr = "User {0} tried to edit fundraising on project {1}".format(g.user.id, project_id)
        current_app.logger.warning(warnStr)
        abort(401) 

    #return render_template('index.html', name = project.name, project_id = project_id, account_id=account_id)

    user = User.objects.with_id(g.user.id)
    udict = user.as_dict()
        
    keys_to_include = ['image_url_round_medium', 'image_url_round_small']
    udata = {x:udict[x] for x in keys_to_include}
 
    return render_template('index.html', project = project, 
                                           udata = udata,
                                           index = True, 
                                           login = False)   