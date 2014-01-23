define ["underscore", "backbone", "model/ProjectCalendarModel"], 
    (_, Backbone, ProjectCalendarModel) ->
        ProjectCalendarCollection = Backbone.Collection.extend
            model: ProjectCalendarModel

            initialize: (options_) ->
                @id = options_.id
            
            url: ->
                "/api/project/#{@id}/calendar"

            parse: (response_) ->
                if response_.success then response_.data else {}