# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, render_template, redirect, url_for
from flask.ext.login import login_required, current_user

from .models import User

user_view = Blueprint('user_view', __name__, url_prefix='/user')

"""
==============
User Views
==============

"""

