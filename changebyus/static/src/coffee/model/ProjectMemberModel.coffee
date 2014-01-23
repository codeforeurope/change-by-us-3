define ["underscore", "backbone"], (_, Backbone) ->
    ProjectMembersModel = Backbone.Model.extend
        parse:(resp_)->
            if resp_.data then resp_.data else resp_

