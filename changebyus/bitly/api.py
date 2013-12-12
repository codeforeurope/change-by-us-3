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

bitly_api = Blueprint('bitly_api', __name__, url_prefix='/api/bitly')

BASE_URL = 'https://api-ssl.bitly.com'

"""
.. module:: bitly.api

    :synopsis: Will use bit.ly to generate shortened urls
"""

def _get_bitly_url(original_url):
    """Converts a long url into a bit.ly url
        Args:
            original_url: url to be shortened.
        Returns:
            bit.ly shortened url
    """

    params = {
        'login' : current_app.settings.get('BITLY').get('LOGIN'),
        'apiKey' : current_app.settings.get('BITLY').get('API_KEY'),
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
    