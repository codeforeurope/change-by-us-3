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
				console.log "this.model", @model
	 
				@$el = $("<div class='user'/>")
				@$el.template @templateDir + "/templates/partials-user/user.html",
					data: @model.attributes, => 
						@ajaxForm()
						@loadProjects()

				$(@parent).append @$el

			ajaxForm: ->
				$signin = $("form[name=signin]")
				$signin.ajaxForm (response) ->
					console.log response

			loadProjects:->
				console.log 'onTemplateLoad'
				@joinedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/joinedprojects"})
				@joinedProjects.on "reset", @addJoined, @
				@joinedProjects.fetch reset: true

				@ownedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/ownedprojects"})
				@ownedProjects.on "reset", @addOwned, @
				@ownedProjects.fetch reset: true
				

			addJoined:->
				@joinedProjects.each (projectModel) => @addOne projectModel, "#following-list"

			addOwned:->
				@ownedProjects.each (projectModel) => @addOne projectModel, "#project-list"

			addOne: (projectModel_, parent_) ->
				view = new ResourceProjectPreviewView(model: projectModel_)
				@$el.find(parent_).append view.$el

		# to do
		# if (success){}
		# if (failure){}
		# CBUUserView

