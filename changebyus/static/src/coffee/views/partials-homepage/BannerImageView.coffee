define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		BannerImageView = AbstractView.extend
		
			initialize: (options_) ->
				AbstractView::initialize.call this, options_
				@render()

			render: ->
				@$el = $("<div class='banner-image'/>")
				@$el.template @templateDir+"/templates/partials-homepage/banner-image.html",
					data: @viewData, => @onTemplateLoad()
				$(@parent).append @$el