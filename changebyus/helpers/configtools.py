from flask import Flask as BaseFlask, Config as BaseConfig

import os
import yaml

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


def get_shared_config(root_app, config_path):
    """
    ABOUT
        Gets an absolute path for the shared config
    """

    d = os.path.abspath(os.path.dirname(root_app.__file__))
    
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
