define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		AbstractModalView = AbstractView.extend

			parent:'body'
		
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			events: 
				"click .close-x": "fadeOut"

			onTemplateLoad:-> 
				$('#page-wrapper').addClass('blur')
				# temp off @$el.find(".close-x").click => @fadeOut()
				delay 10, -> $('.scaled-fade').removeClass('scaled-fade')

			fadeOut:->
				$('#page-wrapper').removeClass('blur')
				$('.success-modal, .embed-modal').addClass('scaled-fade')
				$('.modal-fullscreen').fadeOut 500, => @$el.remove()