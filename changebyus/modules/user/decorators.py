from flask import g, abort
from functools import wraps


def _is_site_admin(user):
    return user.has_role('admin')
    
    
def is_site_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if (not g.user.is_anonymous() and _is_site_admin(g.user)):
            return f(*args, **kwargs)
        else:
            abort(401)
    
    return decorated_function