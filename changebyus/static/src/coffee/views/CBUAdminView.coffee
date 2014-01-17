define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"resource-project-view", 
		"views/partials-project/ProjectMemberListItemView", 
		"collection/FlaggedProjectCollection", 
		"collection/FlaggedUserCollection", 
		"abstract-view"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 ResourceProjectPreviewView,
	 ProjectMemberListItemView, 
	 FlaggedProjectCollection, 
	 FlaggedUserCollection, 
	 AbstractView) ->

		CBUAdminView = AbstractView.extend

			initialize: (options_) ->
				options = options_
				# this is added later
				AbstractView::initialize.call @, options
				
				@flaggedProjects  = options.collection or new FlaggedProjectCollection()
				@flaggedUsers = options.collection or new FlaggedUserCollection()
				
				@render()

			render: -> 
				@$el = $("<div class='body-container'/>")
				@$el.template @templateDir+"/templates/admin.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el
				
			onTemplateLoad:->
				@$projects  = $("#flagged-projects")
				@$users     = $("#flagged-users")
				@$resources = $("#approved-resource")
				
				@$projectsBTN  = $("a[href='#projects']").parent()
				@$usersBTN     = $("a[href='#users']").parent()
				@$resourcesBTN = $("a[href='#resources']").parent()

				@flaggedProjects.on "reset", @addProjects, @
				@flaggedProjects.fetch reset: true

				@flaggedUsers.on "reset", @addUsers, @
				@flaggedUsers.fetch reset: true 

				$(window).bind "hashchange", (e) => @toggleSubView()
				@toggleSubView()

				AbstractView::onTemplateLoad.call @

			addProjects: -> 
				@flaggedProjects.each (projectModel_) =>
					@addProject projectModel_

			addProject: (projectModel_) ->
				view = new ResourceProjectPreviewView({model:projectModel_, isAdmin:true})
				view.render()

				$("#projects-list").append view.$el

			addUsers: -> 
				@flaggedUsers.each (userModel_) =>
					@addUser userModel_

			addUser: (userModel_) -> 
				view = new ProjectMemberListItemView({model:userModel_, isAdmin:true}) 
				view.render()

				$("#users-list").append view.$el

			toggleSubView: -> 
				@currentView = window.location.hash.substring(1)

				for v in [@$projects,@$users,@$resources]
					v.hide()

				for btn in [@$projectsBTN,@$usersBTN,@$resourcesBTN]
					btn.removeClass "active"

				switch @currentView 
					when "users"
						@$users.show() 
						@$usersBTN.addClass "active"
					when "resources" 
						@$resources.show() 
						@$resourcesBTN.addClass "active"
					else 
						@$projects.show()
						@$projectsBTN.addClass "active"