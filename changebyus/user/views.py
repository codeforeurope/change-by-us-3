# -*- coding: utf-8 -*-
from flask import Blueprint, render_template, redirect, url_for
from flask.ext.login import login_required, current_user

from .models import User

user_view = Blueprint('user_view', __name__, url_prefix='/user')


