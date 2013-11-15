define ["underscore", "backbone", "model/ProjectUpdateModel"], (_, Backbone, ProjectUpdateModel) ->
	ProjectUpdatesCollection = Backbone.Collection.extend 

		model: ProjectUpdateModel
		
		initialize: (options) ->
			@id = options.id

		url: ->
			"/api/post/project/" + @id + "/list_updates"

		parse: (response) ->
			if (response.msg is "OK") then response.data else {}

