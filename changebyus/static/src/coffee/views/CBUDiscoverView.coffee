define ["underscore", "backbone", "jquery", "template", "views/partials-discover/BannerSearchView", "resource-project-view", "collection/ProjectListCollection", "abstract-view"], 
	(_, Backbone, $, temp, BannerSearchView, ResourceProjectPreviewView, ProjectListCollection, AbstractView) ->
		CBUDiscoverView = AbstractView.extend

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
				
			addAll: -> 
				@collection.each (projectModel_) =>
					@addOne projectModel_

				if (@collection.length is 0)
					@$el.template @templateDir + "/templates/partials-discover/no-results.html",
						data: @viewData, =>

			addOne: (projectModel_) ->
				view = new ResourceProjectPreviewView({model:projectModel_})
				view.render()

				@$el.find("#project-list").append view.$el

