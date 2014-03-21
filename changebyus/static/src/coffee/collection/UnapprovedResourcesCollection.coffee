define ["underscore", "backbone", "model/ProjectModel"], 
    (_, Backbone, ProjectModel) ->
        UnapprovedResourcesCollection = Backbone.Collection.extend
            model: ProjectModel
             
            url: ->
                "/api/resource/list/unapproved"
            
            parse: (response_) ->
                if response_.success then response_.data else {}