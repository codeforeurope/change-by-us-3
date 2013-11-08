define ["underscore", "backbone", "model/ProjectModel"], (_, Backbone, ProjectModel) ->
	ProjectListCollection = Backbone.Collection.extend
		model: ProjectModel
		url: "/api/project/list"
		parse: (response) ->
			response.data 
