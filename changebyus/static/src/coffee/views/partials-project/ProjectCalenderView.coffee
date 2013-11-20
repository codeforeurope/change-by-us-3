define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
	(_, Backbone, $, temp, ProjectSubView) ->
		ProjectCalenderView = ProjectSubView.extend
			parent: "#project-calendar"
			
			render: -> 
				@$el = $("<div class='project'/>")
				@$el.template @templateDir + "/templates/partials-project/project-calendar.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				@$el.find(".preload").remove()
				$('#embed-calendar').click (e)=>
					e.preventDefault()
					@projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({model:@model})