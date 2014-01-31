define ["underscore", "backbone", "model/ProjectDiscussionModel"], 
    (_, Backbone, ProjectDiscussionModel) ->
        ProjectDiscussionsCollection = Backbone.Collection.extend
            model: ProjectDiscussionModel

            initialize: (models_, @options)->
                @id = @options.id
            
            url: ->
                "/api/post/project/#{@id}/discussions?sort=created_at&order=desc&"
            
            parse: (response_) ->
                if response_.success then response_.data else {}
