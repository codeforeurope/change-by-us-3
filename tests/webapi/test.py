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
        

    def setup_func():
        "set up test fixtures"

    def teardown_func():
        "tear down test fixtures"

    @with_setup(setup_func, teardown_func)
    def test():
        "test ..."


    def login(self):
        print "hi we logged in"
        assert True


class LogoutTest(LoginTest):

    def logout(self):
        print "hi we logged out"
        assert True
        