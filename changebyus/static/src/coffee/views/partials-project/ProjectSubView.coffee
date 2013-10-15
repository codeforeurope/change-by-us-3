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
		noResults:->
		
		# override in subview
		addOne: (model) ->
			
		# override in subview
		addAll: -> 
			if @collection.models.length is 0 then @noResults() else @$el.find(".preload").remove()

			console.log 'ProjectSubView addAll @collection.',@collection.models
			@collection.each (model) => 
				console.log 'ProjectSubView >>>>',@
				@addOne model

			@isDataLoaded = true

			

