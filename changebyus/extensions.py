# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

"""
=================
Extensions File
=================

Allows an easy overview of what extensiosn we chose for 
each project
"""

from flask.ext.login import LoginManager
login_manager = LoginManager()

from flask.ext.mongoengine import MongoEngine
db = MongoEngine()
