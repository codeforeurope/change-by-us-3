define ["underscore", "backbone", "model/UserModel"], 
    (_, Backbone, UserModel) ->
        ProjectMembersCollection = Backbone.Collection.extend 
            model: UserModel
            order: 'name'

            url: ->
                "/api/project/#{@id}/users"

            parse: (response_) -> 
                if response_.success then response_.data else {}