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


def jsonify_response(input_dict, status_code = 200, status = 'OK', indent=None):
    """ 
    ABOUT
        Had to created our own jsonify method because the flask version
        defaults to indent=2 if not a XHTTP resquest.
        Also this routine allows us to enforce a response structure of
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
            ... [data]
        }
    """
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
