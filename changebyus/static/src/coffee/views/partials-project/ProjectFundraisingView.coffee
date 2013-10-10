define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
	ProjectFundraisingView = AbstractView.extend
		
		parent: "#project-calendar"
		
		initialize: (options) ->
			AbstractView::initialize.call @, options
			@render()

		render: ->  
			@$el = $(@parent)
			if @started
				@$el.template @templateDir + "/templates/partials-project/project-fundraising-goals.html",
					{data: @viewData}, =>
			else
				@$el.template @templateDir + "/templates/partials-project/project-fundraising-get-started.html", 
					{}, ->

