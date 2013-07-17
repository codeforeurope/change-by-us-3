from flask import request, current_app

try:
    import simplejson as json
except ImportError:
    import json

def get_form(var):
    """
    ABOUT
        Helper that returns the form value or None if it doesn't exist
    TODO
        Apply this to CBU, there are places we do this check explicitly
    """
    if var in request.form and request.form[var]:
        return request.form[var]
    else:
        return None


def jsonify(d, indent=None):
    """ 
    ABOUT
        Had to created our own jsonify method because the flask version
        defaults to indent=2 if not a XHTTP resquest.
    """
    return current_app.response_class(json.dumps(d, indent=indent), 
                                      mimetype='application/json')


def gen_blank_ok():
    """
    ABOUT
        Used for sending a simple OK web response
    INPUT
        None
    OUTPUT
        Blank web response, status code 200
    """
    resp = jsonify({})
    resp.status_code = 200

    return resp


def gen_ok(resp):
    """
    ABOUT
        Just injects a 200 code into an already existing response
    INPUT
        Flask response
    OUTPUT
        Same Flask response with 200 status code
    """
    resp.status_code = 200

    return resp