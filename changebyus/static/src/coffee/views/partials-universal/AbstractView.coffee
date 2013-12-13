define ["underscore", "backbone", "jquery", "template"], 
	(_, Backbone, $, temp) ->
		AbstractView = Backbone.View.extend
			
			parent: "body"
			templateDir: "/static"
			viewData: {}
			templateLoaded: false
			delayedCollectionLoad: false
			id: 0

			initialize: (options_) ->
				options      = options_ or {}
				@id          = options.id or @id
				@templateDir = options.templateDir or @templateDir
				@parent      = options.parent or @parent
				@viewData    = options.viewData or @viewData

			onTemplateLoad:->
				@trigger 'ON_TEMPLATE_LOAD'
				@templateLoaded = true
				if @delayedCollectionLoad then @loadData()
				@delegateEvents()
				#override in subview

			changeHash:(e)-> 
				# hack to override backbone router
				window.location.hash = $(e.currentTarget).attr("href").substring(1)
			
			show: ->
				@$el.show()

			hide: ->
				@$el.hide()

			fetch:->
				@model.fetch
					success:(r)=>
						@onFetch r 

			onFetch:(r)->
				#hook 