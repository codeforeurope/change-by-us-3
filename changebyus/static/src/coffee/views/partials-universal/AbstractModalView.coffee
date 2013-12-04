define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		AbstractModalView = AbstractView.extend

			parent:'body'
		
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			onTemplateLoad:-> 
				$('#page-wrapper').addClass('blur')
				@$el.find(".close-x").click => @fadeOut()
				delay 10, -> $('.scaled-fade').removeClass('scaled-fade')

			fadeOut:->
				$('#page-wrapper').removeClass('blur')
				$('.success-modal').addClass('scaled-fade')
				$('.modal-fullscreen').fadeOut 500, => @$el.remove()