define ["underscore", "backbone", "model/UserModel", ], 
	(_, Backbone, UserModel) ->
		ProjectMembersCollection = Backbone.Collection.extend 
			model: UserModel
			order: 'name'
			
			initialize: (options) ->
				@id = options.id

			url: ->
				"/api/project/#{@id}/users"

			parse: (response) -> 
				if response.success then response.data else {}

			