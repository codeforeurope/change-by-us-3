define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"form", 
		"resource-project-view", 
		"views/partials-homepage/BannerImageView", 
		"collection/ProjectListCollection", 
		"collection/ResourceListCollection", 
		"abstract-view"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 form, 
	 ResourceProjectPreviewView, 
	 BannerImageView, 
	 ProjectListCollection, 
	 ResourceListCollection, 
	 AbstractView) ->
		CBUMainView = AbstractView.extend

			initialize: (options) ->
				@templateDir        = options.templateDir or @templateDir
				@parent             = options.parent or @parent
				@viewData           = options.viewData or @viewData
				@collection         = options.collection or new ProjectListCollection()
				@resourceCollection = options.resourceCollection or new ResourceListCollection()
				@render()

			render: -> 
				@$el = $("<div class='projects-main'/>")
				@$el.template @templateDir + "/templates/main.html", {}, => @onTemplateLoad()

			onTemplateLoad:->
				$(@parent).prepend @$el
				
				bannerParent = @$el.find(".body-container-wide")
				bannerImageView = new BannerImageView({parent:bannerParent})
				
				@collection.on "reset", @addAll, @
				@collection.fetch reset: true

				@resourceCollection.on "reset", @addAllResources, @
				@resourceCollection.fetch reset: true
				
				@ajaxForm()

			ajaxForm: ->
				# AJAXIFY THE SIGNUP FORM
				$signup = $("form[name=signup]")
				$signup.ajaxForm (response) ->
					console.log response
				
				# AJAXIFY THE SIGNIN FORM
				$signin = $("form[name=signin]")
				$signin.ajaxForm (response) ->
					console.log response

			addAll: ->  
				@collection.each (projectModel) => 
					@addProject projectModel
				onPageElementsLoad() 

			addProject: (projectModel) ->
				view = new ResourceProjectPreviewView(model: projectModel)
				@$el.find("#project-list").append view.$el

			addAllResources: ->
				@resourceCollection.each (projectModel) => 
					@addResource projectModel
				onPageElementsLoad() 

			addResource: (projectModel) ->
				view = new ResourceProjectPreviewView(model: projectModel)
				@$el.find("#resource-list").append view.$el