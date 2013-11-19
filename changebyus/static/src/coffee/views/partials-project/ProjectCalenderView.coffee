define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectEmbedCalendarModalView"], 
	(_, Backbone, $, temp, ProjectSubView, ProjectEmbedCalendarModalView) ->
		ProjectCalenderView = ProjectSubView.extend
			isMember:false
			parent: "#project-calendar"
			projectEmbedCalendarModalView: null
			
			initialize: (options) -> 
				ProjectSubView::initialize.call @, options
				@viewData          = @model.attributes
				@viewData.isMember = options.isMember || @isMember
				
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

