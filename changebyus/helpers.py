# -*- coding: utf-8 -*-
import os
import yaml
import hashlib
import re
from PIL import Image
from PIL import ImageOps
import os
import string
import random

from flask import Flask as BaseFlask, Config as BaseConfig, request, current_app

try:
    import simplejson as json
except ImportError:
    import json

# is this import needeD?
import changebyus


"""
==========
Helpers
===========
Global routines used in multiple functions  
---------------------------------------------

"""


def db_list_to_dict_list(db_list):
    """
    ABOUT
        Convert a list of database objects into their .as_dict objects
    INPUT
        List of mongodb database objects
    OUTPUT 
        List of python dictionary objects
    """
    dict_list = []
    for db_item in db_list:
        dict_list.append( db_item.as_dict())

    return dict_list

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


def generate_thumbnails(filepath):
    """
    ABOUT
        Routine that will take a full sized image path and generate
        an x,y sized thumbnail with the naming convention 
        name_thumb.extension
    INPUT
        Path to an image, any standard extension
    OUTPUT
        File path for an image of 1020,320 pixels
    TODO
        Make the image output size a parameter
    """

    # note if you change these guys you need to change templates and the project model
    sizeLarge = 1020,320
    sizeMed = 300, 94
    sizeSmall = 160, 50

    try:

        img = Image.open(filepath)
 
        path, image = os.path.split(filepath)

        path_large = os.path.join(path, '1020.320.' + image)
        img = ImageOps.fit(image=img, size=sizeLarge, method=Image.ANTIALIAS)
        img.save(path_large, img.format)

        path_medium = os.path.join(path, '300.94.' + image)
        img = ImageOps.fit(image=img, size=sizeMed, method=Image.ANTIALIAS)
        img.save(path_medium, img.format)

        path_small = os.path.join(path, '160.50.' + image)
        img = ImageOps.fit(image=img, size=sizeSmall, method=Image.ANTIALIAS)
        img.save(path_small, img.format)

        return True

    except IOError as e:
        print "IOError ", e
        return False


def string_generator(size=6, chars=string.ascii_uppercase + string.digits):
    """
    ABOUT
        Routine that generates a random string of a certain size
    INPUT
        size, base characters
    OUTPUT
        random string
    """
    return ''.join(random.choice(chars) for x in range(size))


def swap_null_id(d):
    """
    ABOUT
        For some reason mongodb objects have their object id set to the None key.
        This will switch it into the 'id' key
    INPUT
        Mongodb object
    OUTPUT
        Mongodb object with it's id set to the 'id' key and the None key removed
    """
    if None in d and 'id' not in d:
        d['id'] = d[None]
        del d[None]


def get_shared_config(config_path):
    """
    ABOUT
        Gets an absolute path for the shared config
    """
    d = os.path.abspath(os.path.dirname(changebyus.__file__))
    
    return os.path.join(d, config_path)


def get_config(prefix=None, app=None):
    """
    ABOUT
        Takes the yml file and turns it into a dictionary
    """
    rv = {}
    app = app or current_app
    for key, value in app.config.items():
        if not prefix:
            rv[key] = value
            continue
        if key.startswith(prefix):
            rv[key.replace(prefix, '')] = value
    return rv
    
def get_path_from_config(key, app=None):
    """
    ABOUT
        Needs to be documented
    """
    app = app or current_app
    val = app.config[key]
    if not val.startswith('/'):
        return '%s/%s' % (os.getcwd(), val)
    return val
    
def jsonify(d, indent=None):
    """ 
    ABOUT
        Had to created our own jsonify method because the flask version
        defaults to indent=2 if not a XHTTP resquest.
    """
    return current_app.response_class(json.dumps(d, indent=indent), 
                                      mimetype='application/json')
                                      
def hash_string(s):
    """
    ABOUT
        Needs to be documented
    """
    sha1 = hashlib.sha1()
    sha1.update(s)
    return sha1.hexdigest()
    
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

class Config(BaseConfig):
    """
    ABOUT
        Flask config enhanced with a `from_yaml` method.
    """
    def from_yaml(self, fn):

        if not os.path.exists(fn):
            raise Exception("Could not find config file : %s" % fn)

        with open(fn) as f:
            c = yaml.load(f)

        for key, value in c.items():
            if key.isupper():
                self[key] = value

        self.render_tokens()

    def render_tokens(self):
        for key, value in self.items():
            if isinstance(value, basestring) and '%(CONFIG__' in value:
                value = value.replace('%(CONFIG__', '%(')
                self[key] = value % self


class Flask(BaseFlask):
    """
    ABOUT
        Extended version of `Flask` that implements custom config 
        class and adds `register_middleware` method
    """

    def make_config(self, instance_relative=False):
        root_path = self.root_path
        if instance_relative:
            root_path = self.instance_path
        return Config(root_path, self.default_config)

    def register_middleware(self, middleware_class):
        """Register a WSGI middleware on the application
        :param middleware_class: A WSGI middleware implementation
        """
        self.wsgi_app = middleware_class(self.wsgi_app)

        
