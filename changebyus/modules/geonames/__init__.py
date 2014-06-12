import inspect
import os
import requests
import simplejson as json
import yaml

from flask import current_app as app


def get_geopoint(s, exact=False):
    """
    Accept a geoname or postalcode and return a 'name' and lat/lon.
    Data is pulled from the geonames API.
    """
    is_postal = s.isdigit()

    if (is_postal):
        varname = 'postalcode' if exact else 'postalcode_startsWith'
        dataname = 'postalCodes'
        url = app.settings.get('GEONAMES').get('POSTALCODE_SEARCH_URL')
    else:
        varname = 'name_equals' if exact else 'name_startsWith'
        dataname = 'geonames'
        url = app.settings.get('GEONAMES').get('SEARCH_URL')

    params = {'country': app.settings.get('GEONAMES').get('COUNTRY'),
              'maxRows': app.settings.get('GEONAMES').get('MAXROWS'),
              'username': app.settings.get('GEONAMES').get('USERNAME'),
              varname: s}

    r = requests.get(url, params=params)
    data = []

    if (r.status_code != 200):
        app.logger.error("Unsuccessful http response from %s" % r.url)
    else:
        json_data = r.json()

        if dataname not in json_data:
            app.logger.error("Error on %s: %s" % (r.url, r.status_code))
        else:
            for x in json.loads(r.text)[dataname]:
                data.append({'name': "%s, %s" % (x['placeName'], x['adminCode1']) if is_postal \
                    else "%s, %s" % (x['name'], x['adminCode1']),
                             'zip': "%s" % x['postalCode'] if is_postal else "",
                             'lat': x['lat'],
                             'lon': x['lng']})
    return data


def get_geoname(lat, lng):
    """
    Accept a geoname or postalcode and return a 'name' and lat/lon.
    Data is pulled from the geonames API.
    """

    params = {'country': app.settings.get('GEONAMES').get('COUNTRY'),
              'maxRows': app.settings.get('GEONAMES').get('MAXROWS'),
              'username': app.settings.get('GEONAMES').get('USERNAME'),
              'lat': lat,
              'lng': lng}

    url = app.settings.get('GEONAMES').get('COORDINATE_SEARCH_URL')

    r = requests.get(url, params=params)
    data = []
    dataname = 'geonames'

    if (r.status_code != 200):
        app.logger.error("Unsuccessful http response from %s" % r.url)
    else:
        json_data = r.json()

        if dataname not in json_data:
            app.logger.error("Error on %s: %s" % (r.url, json_data['status']))
        else:
            for x in json.loads(r.text)[dataname]:
                data.append({'name': "%s, %s" % (x['adminName1'], x['adminCode1']),
                             'lat': x['lat'],
                             'lon': x['lng']})
    return data
