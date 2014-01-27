define ["underscore", "backbone", "model/ProjectModel"], 
    (_, Backbone, ProjectModel) ->
        UnapprovedResourcesCollection = Backbone.Collection.extend
            model: ProjectModel
             
            url: ->
                "/api/project/list?is_resource=true&"
            
            parse: (response_) ->
                if response_.success then response_.data else {}