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

<<<<<<< HEAD
			onTemplateLoad:->
				@$el.find(".preload").remove()
				$('#embed-calendar').click (e)=>
					e.preventDefault()
					@projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({model:@model})

=======
			
>>>>>>> 5bfaf1db13a264c9c0fb7b8e30f4d187d708c531
