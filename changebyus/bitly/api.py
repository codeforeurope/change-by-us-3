# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""
from flask import Blueprint, current_app

import requests
import yaml
import os
import inspect
import requests
import urllib

root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
settings = yaml.load(file(root_directory + '/config/bitly.yml'))

bitly_api = Blueprint('bitly_api', __name__, url_prefix='/api/bitly')

BASE_URL = 'https://api-ssl.bitly.com'

"""
=========================
Bit.ly Webservice Wrapper
=========================

This is a webservice that will send large urls to bitly and return the 
shortened url.  The use case is rather obvious.
"""

def _get_bitly_url(original_url):
    """
    ABOUT
        Converts a long url into a bit.ly url
    METHOD
        Get
    INPUT
        Url
    OUTPUT
        bit.ly url OR ''
    PRECONDITIONS
        API key exists in the config file
    """

    params = {
        'login' : settings['LOGIN'],
        'apiKey' : settings['API_KEY'],
        'longUrl' : original_url
    }

    api_url = '/v3/shorten?'
    url = BASE_URL + api_url + urllib.urlencode(params)
    resp = requests.get(url)
    json = resp.json()

    if json['status_code'] != 200:
        errStr = "Bitly for base url {0} failed: {1}".format(original_url, resp.text)
        current_app.logger.error(errStr)

        return ''

    return json['data']['url']