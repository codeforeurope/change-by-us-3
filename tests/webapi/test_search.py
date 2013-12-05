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


class SearchTest(BaseTestCase):
    """
    All tests currently assume projects created with project tests, 
    i.e. they have 'lorem' in the text and a location in NYC
    
    TODO: get some verbosity in here
    """
    search_string = "lorem"
    # Brooklyn, NY, 11217
    search_lat = "40.68165"
    search_lon = "-73.979797"
    search_dist = "10"
    url = "/api/project/search"

    def test_text_search(self):
        search_url = "{0}?s={1}".format(self.url, self.search_string)
        results = self.GET(search_url)
                
        self.assertTrue(len(results) > 0)

#   COMMENTED OUT pending writing a test for creating resources
#     def test_text_resource_search(self):
#         search_url = "{0}?s={1}&type=resource".format(self.url, self.search_string)
#         results = self.GET(search_url)
#                 
#         self.assertTrue(len(results) > 0)
        
    def test_geo_search(self):
        search_url = "{0}?lat={2}&lon={3}&d={4}".format(self.url, 
                                              self.search_string,
                                              self.search_lat,
                                              self.search_lon,
                                              self.search_dist)
        results = self.GET(search_url)
                
        self.assertTrue(len(results) > 0)
        
    def test_text_geo_search(self):
        search_url = "{0}?s={1}&lat={2}&lon={3}&d={4}".format(self.url, 
                                                      self.search_string,
                                                      self.search_lat,
                                                      self.search_lon,
                                                      self.search_dist)
        results = self.GET(search_url)
                
        self.assertTrue(len(results) > 0)
        
    def test_category_search(self):
        search_url = "{0}?s={1}&cat=animals".format(self.url, 
                                                      self.search_string)
        results = self.GET(search_url)
                
        self.assertTrue(len(results) > 0)
 