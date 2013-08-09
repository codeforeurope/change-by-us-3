# -*- coding: utf-8 -*-
"""
    NS11MM Test Template
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    Template to start new test cases from

    :copyright: (c) 2012 Local Projects
    :license:
"""
from __future__ import with_statement
import datetime
import flask

from nose.tools import assert_equal, assert_true, assert_false, with_setup

from tests import BaseTestCase

from tests import (string_generator, email_generator, password_generator,
                   timestamp_generator, name_generator, text_generator,
                   unicode_generator, unicode_email_generator)


class LoginTest(BaseTestCase):
    #
    # """Use the template below for new test cases"""
    # def dummy_test(self):
    #     """Template to start from"""
    #     response = self.client.get('/resource/to/call', environ_overrides={'REMOTE_ADDR': '127.0.0.1'})
    #     data = json.loads(response.data)
    #     self.assertTrue(data.get('code') == 200, str(data))
    #                  }
    #     response = self.client.post('/post/resource', data=json_data, 
    #                                 environ_overrides={'REMOTE_ADDR': '127.0.0.1'}, 
    #                                 content_type="application/json")
    #
        
    def s(self, field, val):
        self.vars[field] = val

    def g(self, field):
        return self.vars[field]

    def setUp(self):
        print "set up test fixtures"
        setattr(self, "vars", {})
        self.s('email', email_generator())
        self.s('password', password_generator())

        self.s('email', 'tom@tom.net')
        self.s('password', 'tom')

    def test(self):

        #create_user

        data = {'email':self.g('email'), 
                'password':self.g('password')}
        resp = self.POST('/login', data = data)
        print "login response is ", resp


        