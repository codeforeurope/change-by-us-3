# -*- coding: utf-8 -*-
"""
    CBU Tests Init
    ~~~~~~~~~~~~~~~~~~

    Initialize the app and the database for the tests and provide common
    functions.

    To set breakpoints for the debugger, add the following right where you want
    the debugger to break:
    
        from nose.tools import set_trace; set_trace()


    :copyright: (c) 2013 Local Projects
    :license: 
"""
from flask.ext.testing import TestCase
from changebyus import app as cbu_app
from testtools import *

from simplejson.decoder import JSONDecodeError
import datetime
import os
import simplejson as json

class BaseTestCase(TestCase):
    """Base TestClass for application"""
    TESTING = True
    CSRF_ENABLED = False

    def create_app(self):
        #print "cbu_app ", dir(cbu_app)
        cbu_app.settings['TESTING'] = self.TESTING
        cbu_app.settings['CSRF_ENABLED'] = self.CSRF_ENABLED

        return cbu_app
    
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
    