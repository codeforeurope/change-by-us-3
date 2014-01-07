define ["underscore", "backbone", "jquery", "template", "resource-project-view", "collection/FlaggedProjectCollection", "abstract-view"], 
	(_, Backbone, $, temp, ResourceProjectPreviewView, FlaggedProjectCollection, AbstractView) ->
		CBUAdminView = AbstractView.extend

			initialize: (options) ->
				# this is added later
				AbstractView::initialize.call @, options
				@collection  = options.collection or new FlaggedProjectCollection()
				@render()

			render: -> 
				@$el = $("<div class='discover'/>")
				@$el.template @templateDir+"/templates/admin.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				@collection.on "reset", @addAll, @
				@collection.fetch reset: true

			addAll: -> 
				@collection.each (projectModel_) =>
					@addOne projectModel_

			addOne: (projectModel_) ->
				view = new ResourceProjectPreviewView({model:projectModel_})
				view.render()

				@$el.find("#project-list").append view.el

			