# -*- coding: utf-8 -*-

def post_delete_permission(f):
   @wraps(f)
   def decorated_function(*args, **kwargs):
        project_id = request.form.get('project_id') or request.view_args.get('project_id')

        errStr = ''
        if project_id is None:
            errStr = "project_id can not be blank."
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))
   
        try:
            project = Project.objects.with_id(project_id)
            if project is None:
                errStr = "project {0} does not exist.".format(project_id)
                return jsonify_response( ReturnStructure( success = False,
                                                          msg = errStr ))
        
        except Exception as e:
            infoStr = "Exception looking up project of id {0}".format(project_id)
            current_app.logger.info(infoStr)
            errStr = "Project {0} does not exist.".format(project_id)
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))


        return f(*args, **kwargs)

   return decorated_function



def post_edit_permission(f):
   @wraps(f)
   def decorated_function(*args, **kwargs):
        project_id = request.form.get('project_id') or request.view_args.get('project_id')

        errStr = ''
        if project_id is None:
            errStr = "project_id can not be blank."
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))
   
        try:
            project = Project.objects.with_id(project_id)
            if project is None:
                errStr = "project {0} does not exist.".format(project_id)
                return jsonify_response( ReturnStructure( success = False,
                                                          msg = errStr ))
        
        except Exception as e:
            infoStr = "Exception looking up project of id {0}".format(project_id)
            current_app.logger.info(infoStr)
            errStr = "Project {0} does not exist.".format(project_id)
            return jsonify_response( ReturnStructure( success = False,
                                                      msg = errStr ))


        return f(*args, **kwargs)

   return decorated_function