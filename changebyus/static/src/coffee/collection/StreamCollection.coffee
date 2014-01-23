define ["underscore", "backbone", "model/UpdateModel"], 
    (_, Backbone, UpdateModel) ->
        StreamCollection = Backbone.Collection.extend 
            model: UpdateModel

            url: ->
                "/api/stream"

            parse: (response_) -> 
                if response_.success then response_.data else {}

