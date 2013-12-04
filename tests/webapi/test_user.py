# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

from __future__ import with_statement
import datetime
import flask

from nose.tools import ( assert_equal as _assert_equal, 
                         assert_true as _assert_true, 
                         assert_false as _assert_false, 
                         with_setup )

from tests import BaseTestCase

import simplejson as json

from tests import (string_generator, email_generator, password_generator,
                   timestamp_generator, name_generator, text_generator,
                   unicode_generator, unicode_email_generator, zipcode_generator,
                   url_generator, gcal_code_generator, project_category_generator)

from classes.userClass import *

class UserTests(BaseTestCase):

    def setUp(self):
        self.user = UserClass()
    
    def test_login_update(self):
    #def login_update(self):
        self.user.createUser(self)
        self.GET('/logout')
        self.user.login(self)

        # change email permissions
        update = {'public_email': True}
        resp = self.POST('/api/user/edit', data = json.dumps(update), content_type="application/json")
        self.assertTrue( resp['success'] )
        self.assertTrue( resp['data']['email'] == self.user.email )

        update = {'public_email': False}
        resp = self.POST('/api/user/edit', data = json.dumps(update), content_type="application/json")
        self.assertTrue( resp['success']  )

        self.GET('/logout')
        resp = self.GET('/api/user/{0}'.format(self.user.user_id))
        self.assertTrue( resp['data']['email'] == None )
