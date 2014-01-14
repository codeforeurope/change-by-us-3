define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"views/partials-discover/BannerSearchView", 
		"resource-project-view", 
		"collection/ProjectListCollection", 
		"abstract-view"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 BannerSearchView, 
	 ResourceProjectPreviewView, 
	 ProjectListCollection, 
	 AbstractView) ->
	 	
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
				
				@bannerSearchView = new BannerSearchView({parent:searchParent})
				@bannerSearchView.on "ON_RESULTS", (s)=> @onResults(s)

				@collection.on "reset", @addAll, @
				@collection.fetch reset: true

				AbstractView::onTemplateLoad.call @

			updatePage:->
				@bannerSearchView.updatePage()

			nextPage:(e)->
				@bannerSearchView.nextPage(e)

			prevClick:(e)->
				@bannerSearchView.prevClick(e)

			pageClick:(e)->
				@bannerSearchView.pageClick(e)

			checkArrows:->
				@bannerSearchView.checkArrows()
				
			onResults:(size_)->
				console.log 'size_',size_
				if size_ > 0
					@$el.find("#no-result").hide()
				else
					@$el.find("#no-result").show().template @templateDir+"/templates/partials-discover/no-results.html",
						data: {}, =>
