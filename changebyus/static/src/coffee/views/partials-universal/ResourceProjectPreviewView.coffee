define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		ResourceProjectPreviewView = AbstractView.extend

			isProject:false
			isResource:false
			isOwned:false
			isFollowed:false

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@isProject  = options.isProject || @isProject
				@isResource = options.isResource || @isResource
				@isOwned    = options.isOwned || @isOwned
				@isFollowed = options.isFollowed || @isFollowed
				@render()

			render: ->
				viewData            = @model.attributes
				viewData.isProject  = @isProject
				viewData.isResource = @isResource
				viewData.isOwned    = @isOwned
				viewData.isFollowed = @isFollowed

				@$el = $("<li class='project-preview'/>")
				@$el.template @templateDir+"/templates/partials-universal/project-resource.html", 
					{data: viewData}, => #console.log ''

			onFetch:(r)-> 
				$(@parent).append @render() 