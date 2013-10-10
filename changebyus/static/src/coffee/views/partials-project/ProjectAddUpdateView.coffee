define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectUpdateFormView"],
	(_, Backbone, $, temp, AbstractView, ProjectUpdateFormView) ->
		ProjectAddUpdateView = AbstractView.extend

			parent: "#project-update"
		
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: -> 
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-add-update.html",
					{data: @viewData}, =>
						updateDiv = @$el.find("#update-form")
						form = new ProjectUpdateFormView({parent:updateDiv})
