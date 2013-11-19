define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectEmbedCalendarModalView"], 
	(_, Backbone, $, temp, ProjectSubView, ProjectEmbedCalendarModalView) ->
		ProjectCalenderView = ProjectSubView.extend
			parent: "#project-calendar"
			projectEmbedCalendarModalView: null
			
			render: -> 
				@$el = $("<div class='project'/>")
				@$el.template @templateDir + "/templates/partials-project/project-calendar.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				@$el.find(".preload").remove()
				$('.highlight').click (e)=>
					e.preventDefault()
					@projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({model:@model})

