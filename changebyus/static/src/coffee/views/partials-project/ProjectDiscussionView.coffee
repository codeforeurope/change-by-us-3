define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
	(_, Backbone, $, temp, ProjectSubView) ->
		ProjectDiscussionView = ProjectSubView.extend

			render: ->
				@$el = $("<div class='project'/>")
				$(@parent).append @$el

			addOne: (model) ->
				view = $("<div/>")
				view.template @templateDir + "/templates/partials-project/project-discussion.html",
					{data: @viewData}, =>

				@$el.append view 
