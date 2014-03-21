define ["underscore", "backbone", "model/ProjectModel"], 
    (_, Backbone, ProjectModel) ->
        FlaggedProjectCollection = Backbone.Collection.extend
            model: ProjectModel
            
            url: ->
                "/api/project/list?flagged=1&"
            
            parse: (response_) ->
                if response_.success then response_.data else {}