define ["underscore", "backbone"], (_, Backbone) ->
    ProjectModel = Backbone.Model.extend

        urlRoot: "/api/project/"
    
        defaults:
            name: ""
            description: ""
            category: ""
            zip: ""
            website: ""
            visibility: "private"

        parse:(resp_)->
            if resp_.data then resp_.data else resp_

 