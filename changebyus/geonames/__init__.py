import inspect
import os
import requests
import simplejson as json
import yaml

from flask import current_app


root_directory = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
settings = yaml.load(file(root_directory + '/config/geonames.yml'))


def get_geopoint(s, exact=False):
    """
    Accept a geoname or postalcode and return a 'name' and lat/lon.
    Data is pulled from the geonames API.
    """
    is_postal = s.isdigit()

    if (is_postal):
        varname = 'postalcode' if exact else 'postalcode_startsWith'
        dataname = 'postalCodes'
        url = settings['POSTALCODE_SEARCH_URL']
    else:
        varname = 'name_equals' if exact else 'name_startsWith'
        dataname = 'geonames'
        url = settings['SEARCH_URL']
        
    params = {'country': settings['COUNTRY'],
              'maxRows': settings['MAXROWS'],
              'username': settings['USERNAME'],
              varname: s}
              
    r = requests.get(url, params = params)
    data = []
    
    if (r.status_code != 200):
        current_app.logger.error("Unsuccessful http response from %s" % r.url)
    else:
        json_data = r.json()
        
        print(r.url)
        
        if dataname not in json_data:
            current_app.logger.error("Error on %s: %s" % (r.url, json_data['status']))
        else:
            for x in json.loads(r.text)[dataname]:
                data.append({'name': "%s, %s, %s" % (x['placeName'], x['adminCode1'], x['postalCode']) if is_postal \
                                                     else "%s, %s" % (x['name'], x['adminCode1']),
                             'lat': x['lat'],
                             'lon': x['lng']})
                     
    return data
    
