# -*- coding: utf-8 -*-
"""
    :copyright: (c) 2013 Local Projects, all rights reserved
    :license: Affero GNU GPL v3, see LICENSE for more details.
"""

"""
.. module:: flasktools

    :synopsis: A set of tools to help flask interactions

"""

from flask import request, current_app as app
from werkzeug import MultiDict

try:
    import simplejson as json
except ImportError:
    import json


class ReturnStructure():
    """
        A standardized return structure that is a dict of 
        data, success (True/False), msg
    """
    def __init__(self, data = {}, success = True, msg = 'OK'):
        self.success = success
        self.msg = msg
        self.data = data

    def as_dict(self):
        data = { 'success' : self.success,
                 'msg' : self.msg,
                 'data' : self.data }

        return data


def jsonify_response(data, status_code = 200, status = 'OK', indent=None):
    """ 
        Had to created our own jsonify method because the flask version
        defaults to indent=2 if not a XHTTP resquest.
        Also this routine allows us to enforce a response structure.
    
        Args:
            data: input data
            status_code: status code, default 200
            status: status message, default "OK"
            indent: indent

        Returns:
            Flask response with structure
            {
                status_code = 200,
                status = "OK",
                resp {
                    data = { },
                    msg = "OK",
                    success = True
                }
            }
    """

    d = {}

    if isinstance(data, ReturnStructure):
        d = data.as_dict()
    else:
        app.logger.info(infoStr)
        errStr = "jsonify_response expects the data to be of type ReturnStructure."
        app.logger.error(errStr)

        d = {}
        status_code = 500
        status = "ERROR"

    resp =  app.response_class(json.dumps(d, indent=indent), 
                                       mimetype='application/json')

    resp.status = status
    resp.status_code = status_code
    return resp


def gen_blank_ok():
    """Used for sending a simple OK web response
        
        Returns:
            Blank web response, status code 200
    """

    resp = jsonify_response( { } )
    return resp


def as_multidict(data=None):
    """Used to turn a dict into a MultiDict, used inside of WTForm

        Args:
            data: dictionary of source data

        Returns:
            MultiDict representing the source data
    """
    if data is None: return None
    
    resp = MultiDict()
    for key, val in data.items():
        if not isinstance(val, list): val = [val]
        resp.setlist(key, val)
    
    return resp

