define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"],
	(_, Backbone, $, temp, ProjectSubView) ->
		ProjectDiscussionsView = ProjectSubView.extend

			parent: "#project-update"

			render: ->  
				@$el = $(@parent)

			addAll: ->
				console.log 'ProjectDiscussionsView addAll',@collection
				###
				if @collection.models.length is 0
					@$el.template @templateDir + "/templates/partials-project/project-zero-discussions.html", 
						{}, =>
				else
					@$el.template @templateDir + "/templates/partials-project/project-all-discussions.html",
						{data:@collection.models}, =>
				###
				@$el.template @templateDir + "/templates/partials-project/project-all-discussions.html",
					{data:@collection.models}, =>


