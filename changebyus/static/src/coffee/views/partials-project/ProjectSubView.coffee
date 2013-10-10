define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
	ProjectSubView = AbstractView.extend

		isDataLoaded: false
	
		initialize: (options) ->
			console.log 'ProjectSubView options',options
			AbstractView::initialize.call(@, options)
			@render()

		show: ->
			console.log @,'show',@isDataLoaded
			@$el.show()
			unless @isDataLoaded
				@collection.on "reset", @addAll, @
				@collection.fetch {reset: true}

		loadData: ->

		
		# override in subview
		addOne: (model) ->
			
		
		# override in subview
		addAll: -> 
			console.log 'ProjectSubView addAll @collection.',@collection.models
			@collection.each (model) => 
				@addOne model

			@isDataLoaded = true

