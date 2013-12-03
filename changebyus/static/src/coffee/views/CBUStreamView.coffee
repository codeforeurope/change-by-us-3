define ["underscore", "backbone", "jquery", "template", "abstract-view", "collection/StreamCollection", "views/partials-project/ProjectUpdateListItemView"], 
	(_, Backbone, $, temp, AbstractView, StreamCollection, ProjectUpdateListItemView) ->
		CBUStreamView = AbstractView.extend

			initialize: (options_) ->
				AbstractView::initialize.call @, options_
				console.log 'CBUStreamView initialize'
				@collection = new StreamCollection()
				@render()

			render: ->
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/stream.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad: ->
				@$container = @$el.find('.body-container')
				@collection.on "reset", @onCollectionLoad, @
				@collection.fetch {reset: true}

			onCollectionLoad:->
				console.log 'onCollectionLoad'
				@$el.find(".preload").remove()
				@addAll()
				
			addAll: -> 
				@$day = $('<div />')
				@$day.template @templateDir+"/templates/partials-user/stream-day-wrapper.html",
					{}, =>
						if @collection.length > 0
							model_ = @collection.models[0]
							m = moment(model_.get("updated_at")).format("MMMM D")
							@newDay(m)
						
						if @collection.models.length is 0 then @noResults() 
						@collection.each (model) =>  
							@addOne(model)

						@isDataLoaded = true
						onPageElementsLoad()

			newDay:(date_)-> 
				@currentDate = date_
				@$currentDay = @$day.clone()
				@$currentDay.find('h4').html(date_)
				@$container.append(@$currentDay)
				@$projects = @$currentDay.find('.projects-wrapper') 
					
			addOne: (model_) ->
				console.log model_, @$ul
				m = moment(model_.get("updated_at")).format("MMMM D")
				if @currentDate isnt m then @newDay(m)

				view = new ProjectUpdateListItemView({model: model_, isStream:true})
				@$projects.append view.$el 