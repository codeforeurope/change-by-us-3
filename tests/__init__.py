# -*- coding: utf-8 -*-
"""
    NS11MM Tests Init
    ~~~~~~~~~~~~~~~~~~

    Initialize the app and the database for the tests and provide common
    functions.

    To set breakpoints for the debugger, add the following right where you want
    the debugger to break:
    
        from nose.tools import set_trace; set_trace()


    :copyright: (c) 2011 Local Projects
    :license: 
"""
from flask.ext.testing import TestCase
from changebyus import app as cbu_app

import datetime
import os

class BaseTestCase(TestCase):
    """Base TestClass for application"""
    TESTING = True
    CSRF_ENABLED = False

    #--------- For Authenticated Resources ----------
    json_user = {"login": "test_json_user@lp.net"}
    admin_user = {"login": "sundar@localprojects.net", "password": "sundar"}

    def login_as(self, next=None, login=None, password=None):
        if next is not None: next = "next=%s" % next
        else: next = ""
        response = self.POST('/login?%s' % next, 
                             data={"login":login, 
                                   "password":password})
        return response

    def create_app(self):
        return cbu_app()
    
    def setUp(self):
        pass

    def tearDown(self):
        pass

    #----- HELPERS -----
    def GET(self, url=None, data=None, **kwargs):
        """
        :param url: Full URL (with url-params) to request via GET
        :param data: Not used, but provided so that GET and POST can be called the same way
        """
        response = self.client.get(url, **kwargs)
        try:
            data = json.loads(response.data)    
            return data
        except Exception:
            return response

    def POST(self, url=None, data=None, expect_json=True, **kwargs):
        """
        May need to add content_type="application/json", but this sometimes causes problems

        :param url: Full URL (with url-params) to request via GET
        :param expect_json: We may be expectin non-JSON (ie html error) page
        :param data: JSON data to post
        """
        response = self.client.post(url, data=data, **kwargs)
        try:
            data = json.loads(response.data)
        except JSONDecodeError:
            if expect_json: 
                print str(response.data)
            return response
            
        except Exception:
            print str(response.data)
            return response
        
        return data
    
    def PUT(self, url=None, data=None, **kwargs):
        """
        :param url: Full URL (with url-params) to request via GET
        :param data: JSON data to post
        """
        response = self.client.put(url, data=data, **kwargs)
        try:
            data = json.loads(response.data)
        except Exception:
            print str(response.data)
            return response
        
        return data

    def DELETE(self, url=None, data=None, **kwargs):
        """
        :param url: Full URL (with url-params) to request via GET
        :param data: JSON data to post
        """
        response = self.client.delete(url, **kwargs)
        try:
            data = json.loads(response.data)
        except Exception:
            print str(response.data)
            return response
        
        return data
    

class BaseProgramsTest(BaseTestCase):
    prefix = "[ProgramsTests] "
    program_type = None
    
    def setUp(self):
        # Create test records
        self._create_test_programs()
    
    def tearDown(self):
        # Remove test records
        self._delete_test_programs()

    def _create_test_programs(self):
        pass
        
    def _delete_test_programs(self):
        pass