define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectUpdateListItemView"], 
	(_, Backbone, $, temp, ProjectSubView, ProjectUpdateListItemView) ->
		ProjectUpdatesView = ProjectSubView.extend

			parent: "#project-update"
			members: null

			initialize: (options) -> 
				@members = options.members || @members
				ProjectSubView::initialize.call(@, options)

			render: ->  
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-updates.html",
					{data: @viewData}, =>@onTemplateLoad() 

			onTemplateLoad:->
				ProjectSubView::onTemplateLoad.call @
				
				@$ul = @$el.find(".updates-container ul")
				@$members = @$el.find(".team-members ul")
 
				@members.each (model) => 
					@addMemeber model

				onPageElementsLoad()

			addMemeber: (model_) ->
				console.log 'addMemeber',model_
				$member = $('<li/>')
				$member.template @templateDir + "/templates/partials-project/project-member-avatar.html",
					{data: model_.attributes}, =>  
				@$members.append $member
					
			addOne: (model_) ->
				#console.log "ProjectUpdatesView addOne model", model_
				view = new ProjectUpdateListItemView({model: model_})
				@$ul.append view.render().$el 