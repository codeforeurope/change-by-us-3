define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view"
		"views/partials-project/ProjectSubView", 
		"views/partials-project/ProjectEmbedCalendarModalView"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 AbstractView,
	 ProjectSubView, 
	 ProjectEmbedCalendarModalView) ->

		ProjectCalenderView = ProjectSubView.extend
			isOwner:false
			parent: "#project-calendar"
			projectEmbedCalendarModalView: null
			
			initialize: (options_) -> 
				options           = options_ or {}
				@id               = options_.id or @id
				@templateDir      = options_.templateDir or @templateDir
				@parent           = options_.parent or @parent
				@viewData         = @model.attributes
				@viewData.isOwner = options_.isOwner || @isOwner 
				
				@render()
				
				console.log '@viewData >>>>> ',@viewData
			render: -> 
				console.log '@viewData <<<<< ',@viewData
				@$el = $("<div class='project'/>")
				@$el.template @templateDir + "/templates/partials-project/project-calendar.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				@$el.find(".preload").remove()
				$('#embed-calendar').click (e)=>
					e.preventDefault()
					@projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({model:@model})

