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
			isOwner: false
			parent: "#project-calendar"
			projectEmbedCalendarModalView: null
			view: "public"
			
			initialize: (options_) ->  
				options           = options_ or {}
				@id               = options.id or @id
				@templateDir      = options.templateDir or @templateDir
				@parent           = options.parent or @parent 
				if @model
					@viewData     = @model.attributes || @viewData
				@viewData.isOwner = options.isOwner || @isOwner
				@viewData.view    = options.view || @view

				@render()

			events:
				"click #embed-calendar":"embedCalendar"
				
			render: ->  
				@$el = $("<div class='project'/>")
				@$el.template @templateDir + "/templates/partials-project/project-calendar.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				@$el.find(".preload").remove()

			embedCalendar:->
				@projectEmbedCalendarModalView = new ProjectEmbedCalendarModalView({model:@model})

