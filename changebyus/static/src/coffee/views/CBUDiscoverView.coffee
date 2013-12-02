define ["underscore", "backbone", "jquery", "template", "views/partials-discover/BannerSearchView", "resource-project-view", "collection/ProjectListCollection", "abstract-view"], 
	(_, Backbone, $, temp, BannerSearchView, ResourceProjectPreviewView, ProjectListCollection, AbstractView) ->
		CBUDiscoverView = AbstractView.extend
 
			bannerSearchView: null 
				
			initialize: (options) ->
				# this is added later
				AbstractView::initialize.call @, options
				@collection  = options.collection or new ProjectListCollection()
				@render()

			render: -> 
				@$el = $("<div class='discover'/>")
				@$el.template @templateDir+"/templates/discover.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:->
				$(@parent).append @$el
				searchParent = @$el.find(".content")
				bannerSearchView = new BannerSearchView({parent:searchParent})
				@collection.on "reset", @addAll, @
				@collection.fetch reset: true


			addOne: (projectModel) ->
				view = new ResourceProjectPreviewView({model:projectModel})
				@$el.find("#project-list").append view.el

			addAll: -> 
				@collection.each (projectModel) =>
					@addOne projectModel

				if (@collection.length is 0)
					@$el.template @templateDir + "/templates/partials-discover/no-results.html",
						data: @viewData, =>