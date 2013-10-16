define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectUpdateListItemView"], 
	(_, Backbone, $, temp, ProjectSubView, ProjectUpdateListItemView) ->
		ProjectUpdatesView = ProjectSubView.extend

			parent: "#project-update"

			render: ->  
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-updates.html",
					{data: @viewData}, =>@onTemplateLoad() 

			onTemplateLoad:->
				@$ul = @$el.find(".updates-container ul")

			noResults:->

					
			addOne: (model_) ->
				#console.log "ProjectUpdatesView addOne model", model_
				view = new ProjectUpdateListItemView({model: model_})
				@$ul.append view.render().$el