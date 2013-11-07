# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from lettuce import before, after, world
from selenium import webdriver
import lettuce_webdriver.webdriver

"""

world.facebook_login and world.facebook_password for test use with creating a CBU account with 
Facebook credentials and posting updates to Facebook via CBU

world.test_project_name for use with creating a test project and testing other CBU functionalities
with the same project, such as posting updates, creating fundraising and donating

"""

@before.all
def setup_browser():
	if world.browser == None:
		world.browser = webdriver.Firefox()

	world.browser.maximize_window();

@after.all
def teardown_browser(total):
    world.browser.quit()