define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
	ProjectPartialsView = AbstractView.extend

		initialize: (options) ->
			AbstractView::initialize.call @, options
			@render()

		render: ->
			@$el = $("<li class='project-preview'/>")
			@$el.template @templateDir+"/templates/partials-universal/project.html", 
				{data: @model.attributes}, => console.log ''

		onFetch:(r)-> 
			$(@parent).append @render() 