define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		ProjectSubView = AbstractView.extend

			isDataLoaded: false
		
			initialize: (options) -> 
				AbstractView::initialize.call(@, options)
				@render()

			show: -> 
				@$el.show()
				 
				if @collection and @isDataLoaded is false
					if @templateLoaded
						@loadData()
					else
						@delayedCollectionLoad = true

			loadData: ->
				console.log 'loadData', @
				@collection.on "reset", @onCollectionLoad, @
				@collection.fetch {reset: true}

			# override in subview
			noResults:->
				@$el.find('.no-results').show()

			onCollectionLoad:->
				@$el.find(".preload").remove()
				@addAll()
			
			# override in subview
			addOne: (model) ->
				
			# override in subview
			addAll: -> 
				if @collection.models.length is 0 then @noResults() 

				@collection.each (model) =>  
					@addOne model

				@isDataLoaded = true
