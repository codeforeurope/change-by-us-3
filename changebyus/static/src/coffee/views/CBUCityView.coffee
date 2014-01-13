define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"resource-project-view",
		"model/ProjectModel",
		"model/CityModel"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 AbstractView, 
	 ResourceProjectPreviewView,
	 ProjectModel,
	 CityModel) ->
	 	
		CBUCityView = AbstractView.extend
			
			$header:null
			collection:null

			initialize: (options) ->
				AbstractView::initialize.call @, options
				
				@collection  = options.collection or @collection

				$.getJSON "/static/js/config/cities.json", (data)=>
					id     = options.model.id
					obj    = data.cities[id]
					@model = new CityModel(obj)
					@render()

			events:
				"click .change-city a":"changeCity" 

			render: -> 
				@viewData = @model.attributes

				@$el = $("<div class='city-container'/>")
				@$el.template @templateDir+"/templates/city.html", 
					{data:@viewData}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				@projectsView = @$el.find('#featured-projects')
				@resourcesView = @$el.find('#featured-resources')

				@$header = $("<div class='city-header'/>")
				@$header.template @templateDir+"/templates/partials-city/city-header.html",
					{data:@viewData}, => @onHeaderLoaded()
				@$el.prepend @$header

				AbstractView::onTemplateLoad.call @

			onHeaderLoaded:->
				id = @model.get("id")
				config = {id:id}

				@search "project"
				@search "resource"

				@delegateEvents()

			search:(type_)->
				console.log '@model',@model
				dataObj = {
					s: ""
					cat: ""
					loc: ""
					d: "25"
					type: type_
					lat: @model.get("lat")
					lon: @model.get("lon")
				}

				$.ajax(
					type: "POST"
					url: "/api/project/search"
					data: JSON.stringify(dataObj)
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
				).done (response_)=>
					if response_.success 
						if type_ is "project"
							@onProjectsLoad response_.data
						else
							@onResourcesLoad response_.data
					
			onProjectsLoad:(data_)->
				count = 0
				for k,v of data_
					@addOne v._id, @projectsView.find("ul")
					count++

				$featuredProjects = $("#featured-projects")
				$more = $featuredProjects.find('.sub-link')

				if count < 3 then $more.hide()
				if count is 0
					$featuredProjects.hide()
					$('.city-container hr').hide()


			onResourcesLoad:(data_)->
				count = 0
				for k,v of data_
					@addOne v._id, @resourcesView.find("ul")
					count++

				$featuredResources = $("#featured-resources")
				$more = $featuredResources.find('.sub-link')

				if count < 3 then $more.hide()
				if count is 0
					$featuredResources.hide()
					$('.city-container hr').hide()


			addOne: (id_, parent_) -> 
				projectModel = new ProjectModel id:id_
				view = new ResourceProjectPreviewView {model: projectModel, parent:parent_}
				view.fetch()