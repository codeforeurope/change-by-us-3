define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"resource-project-view",
		"model/CityModel", 
		"collection/CityProjectCollection", 
		"collection/CityResourceCollection" ], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 AbstractView, 
	 ResourceProjectPreviewView,
	 CityModel, 
	 CityProjectCollection, 
	 CityResourceCollection) ->
	 	
		CBUCityView = AbstractView.extend
			
			$header:null
			collection:null

			initialize: (options) ->
				AbstractView::initialize.call @, options
				
				@model       = new CityModel(options.model)
				@collection  = options.collection or @collection
				
				###
				@model.fetch 
					success: =>@render()
				###
				@render()

			events:
				"click .change-city a":"changeCity" 

			render: -> 
				@viewData = @model.attributes

				@$el = $("<div class='city-container'/>")
				@$el.template @templateDir+"/templates/city.html", 
					@viewData, => @onTemplateLoad()
				$(@parent).append @$el
				console.log @parent, @$el


			onTemplateLoad:->
				@projectsView = @$el.find('#featured-projects')
				@resourcesView = @$el.find('#featured-resources')

				@$header = $("<div class='city-header'/>")
				@$header.template @templateDir+"/templates/partials-city/city-header.html",
					{data:@viewData}, => @onHeaderLoaded()
				@$el.prepend @$header

			onHeaderLoaded:->
				id = @model.get("id")
				config = {id:id}

				@cityProjectCollection  = new CityProjectCollection(config)  
				@cityProjectCollection.on "reset", @onProjectsLoad, @
				@cityProjectCollection.fetch {reset: true}

				@cityResourceCollection  = new CityResourceCollection(config)
				@cityResourceCollection.on "reset", @onResourcesLoad, @
				@cityResourceCollection.fetch {reset: true}

				@delegateEvents()

			onProjectsLoad:->  
				@cityProjectCollection.each (projectModel) => @addOne(projectModel, @projectsView.find("ul" ), false, true)

			onResourcesLoad:->  
				@cityResourceCollection.each (resourceModel) => @addOne(resourceModel, @resourcesView.find("ul" ), false, true)

			addOne: (model_, parent_) ->
				view = new ResourceProjectPreviewView model: model_
				@$el.find(parent_).append view.$el