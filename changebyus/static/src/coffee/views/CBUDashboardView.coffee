define ["underscore", 
		"backbone", 
		"bootstrap-fileupload", 
		"button"
		"jquery", 
		"template", 
		"abstract-view", 
		"collection/ProjectListCollection", 
		"model/UserModel",
		"resource-project-view",
		"views/partials-user/ProfileEditView"], 
	(_, 
	 Backbone, 
	 fileupload, 
	 button, 
	 $, 
	 temp, 
	 AbstractView, 
	 ProjectListCollection, 
	 UserModel, 
	 ResourceProjectPreviewView, 
	 ProfileEditView) ->

		CBUDashboardView = AbstractView.extend

			location:{name: "", lat: 0, lon: 0} 

			initialize: (options) ->  
				AbstractView::initialize.call @, options
				@userModel = new UserModel(id:@model.id)
				@userModel.fetch 
					success: =>@render() 

			render: -> 
				console.log '@userModel',@userModel
				@$el.template @templateDir+"/templates/dashboard.html", 
					{data:@userModel.attributes}, => 
						@onTemplateLoad()
						@loadProjects()
				$(@parent).append @$el

			onTemplateLoad: ->
				@manageView   = $('#manage-projects')
				@followView   = $('#follow-projects')
				@profileView  = $('#edit-profile')
				
				@manageBTN  = $("a[href='#manage']").parent()
				@followBTN  = $("a[href='#follow']").parent()
				@profileBTN = $("a[href='#profile']").parent()

				$(window).bind "hashchange", (e) => @toggleSubView()
				@toggleSubView()

				# temp hack because somewhere this event default is prevented
				$("a[href^='#']").click (e) -> 
					window.location.hash = $(this).attr("href").substring(1)

				profileEditView = new ProfileEditView({model:@userModel, parent:@profileView})

				console.log '@model',@model

			toggleSubView: -> 
				view = window.location.hash.substring(1)

				for v in [@manageView,@profileView,@followView]
					v.hide()

				for btn in [@followBTN,@profileBTN,@manageBTN]
					btn.removeClass "active"

				switch view 
					when "follow"
						@followView.show()
						@followBTN.addClass "active"
					when "profile"
						@profileView.show()
						@profileBTN.addClass "active"
					else 
						@manageView.show()
						@manageBTN.addClass "active"

			loadProjects:-> 
				@joinedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/joinedprojects"})
				@joinedProjects.on "reset", @addJoined, @
				@joinedProjects.fetch reset: true

				@ownedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/ownedprojects"})
				@ownedProjects.on "reset", @addOwned, @
				@ownedProjects.fetch reset: true

			addJoined:->
				$('a[href=#follow]').append " (#{@joinedProjects.length})"
				console.log $('#follow')
				@joinedProjects.each (projectModel) => @addOne(projectModel, @followView.find("ul" ), false, true)

			addOwned:->
				$('a[href=#manage]').append " (#{@ownedProjects.length})"
				@ownedProjects.each (projectModel) => @addOne(projectModel, @manageView.find("ul"), true, false)

			addOne: (projectModel_, parent_, isOwned_=false, isFollowed_=false) ->
				view = new ResourceProjectPreviewView
					model: projectModel_
					isOwned: isOwned_
					isFollowed: isFollowed_
					isProject: true
					isResource: false

				@$el.find(parent_).append view.$el
