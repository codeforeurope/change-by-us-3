define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
	(_, Backbone, $, temp, ProjectSubView) ->
		ProjectCalenderView = ProjectSubView.extend
			parent: "#project-calendar"
			render: -> 
				@$el = $("<div class='project'/>")
				@$el.template @templateDir + "/templates/partials-project/project-calendar.html",
					{data: @viewData}, =>
						@$el.find(".preload").remove()
				$(@parent).append @$el

			addOne: (model) ->
