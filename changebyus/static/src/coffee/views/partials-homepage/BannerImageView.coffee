define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		BannerImageView = AbstractView.extend
		
			initialize: (options) ->
				AbstractView::initialize.call this, options
				@render()

			render: ->
				@$el = $("<div class='banner-image'/>")
				@$el.template @templateDir + "/templates/partials-homepage/banner-image.html",
					data: @viewData, ->

				$(@parent).append @$el