define ["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel", "collection/ProjectListCollection", "resource-project-view"], 
	(_, Backbone, $, temp, AbstractView, UserModel, ProjectListCollection, ResourceProjectPreviewView) ->
		CBUUserView = AbstractView.extend
			
			joinedProjects:null
			ownedProjects:null
			
			initialize: (options) ->
				AbstractView::initialize.call @, options

				@model = new UserModel(options.model)
				@model.fetch success: =>
					@render() 

			render: ->
				@$el = $("<div class='user'/>")
				@$el.template @templateDir + "/templates/partials-user/user.html",
					data: @model.attributes, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				if (@model.id is window.userID) then $('.edit').removeClass('invisible') 
				@loadProjects()

			loadProjects:->
				@joinedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/joined-projects"})
				@joinedProjects.on "reset", @addJoined, @
				@joinedProjects.fetch reset: true

				@ownedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/owned-projects"})
				@ownedProjects.on "reset", @addOwned, @
				@ownedProjects.fetch reset: true
				
			addJoined:->
				@joinedProjects.each (projectModel) => @addOne projectModel, "#following-list"

			addOwned:->
				@ownedProjects.each (projectModel) => @addOne projectModel, "#project-list"

			addOne: (projectModel_, parent_) ->
				view = new ResourceProjectPreviewView(model: projectModel_)
				@$el.find(parent_).append view.$el