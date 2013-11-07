from flask import request, current_app

try:
    import simplejson as json
except ImportError:
    import json


class ReturnStructure():

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
    ABOUT
        Had to created our own jsonify method because the flask version
        defaults to indent=2 if not a XHTTP resquest.
        Also this routine allows us to enforce a response structure of.
    INPUT
        input_dictionary
        status_code
        error message
        indent
    OUTPUT
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
        current_app.logger.info(infoStr)
        errStr = "jsonify_response expects the data to be of type ReturnStructure."
        current_app.logger.error(errStr)

        d = {}
        status_code = 500
        status = "ERROR"



    resp =  current_app.response_class(json.dumps(d, indent=indent), 
                                       mimetype='application/json')

    resp.status = status
    resp.status_code = status_code
    return resp


def gen_blank_ok():
    """
    ABOUT
        Used for sending a simple OK web response
    INPUT
        None
    OUTPUT
        Blank web response, status code 200
    """

    resp = jsonify_response( { } )
    return resp
