# -*- coding: utf-8 -*-
from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware

from changebyus import app as core_app

app = DispatcherMiddleware(core_app)

if __name__ == '__main__':
    run_simple('0.0.0.0', 5000, app,
               use_reloader=True,
               use_debugger=True,
               use_evalex=True)
