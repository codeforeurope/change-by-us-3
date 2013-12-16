define ["underscore", "backbone", "model/ProjectCalendarModel"], 
	(_, Backbone, ProjectCalendarModel) ->
		ProjectCalendarCollection = Backbone.Collection.extend
			model: ProjectCalendarModel

			initialize: (options) ->
				@id = options.id
			
			url: ->
				"/api/project/#{@id}/calendar"

			parse: (response) ->
				if response.success then response.data else {}