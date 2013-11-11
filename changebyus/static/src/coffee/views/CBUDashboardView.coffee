define ["underscore", "backbone", "jquery", "template", "abstract-view", "collection/ProjectListCollection", "model/UserModel" , "views/partials-project/ProjectPartialsView"], 
	(_, Backbone, $, temp, AbstractView, ProjectListCollection, UserModel, ProjectPartialsView) ->

		CBUDashboardView = AbstractView.extend

			initialize: (options) ->  
				@templateDir = options.templateDir or @templateDir
				@parent = options.parent or @parent
				@viewData = options.viewData or @viewData 
				@userModel = new UserModel(id:@model.id)
				@userModel.fetch 
					success: =>@render() 

			render: -> 
				console.log '@userModel',@userModel
				@$el.template(@templateDir+"/templates/dashboard.html", 
					{data:@userModel.attributes}, => 
						@onTemplateLoad()
						@loadProjects()
				)
				$(@parent).append @$el

			onTemplateLoad: ->  
				# @$el.prepend @$header

				###
				id = @model.get("id")
				config = {id:id}
				projectUpdatesCollection  = new ProjectUpdatesCollection(config)
				projectMembersCollection  = new ProjectMembersCollection(config)
				projectCalendarCollection = new ProjectCalendarCollection(config)
				
				###
				@manageView   = $('#manage-projects')
				@followView   = $('#follow-projects')
				@profileView  = $('#edit-profile')
				
				@manageBTN  = $("a[href='#manage']").parent()
				@followBTN  = $("a[href='#follow']").parent()
				@profileBTN = $("a[href='#profile']").parent()
				
				hash = window.location.hash.substring(1)
				@toggleSubView (if (hash is "") then "updates" else hash)
				$(window).bind "hashchange", (e) =>
					hash = window.location.hash.substring(1)
					@toggleSubView hash

				# temp hack because somewhere this event default is prevented
				$("a[href^='#']").click (e) -> 
					window.location.hash = $(this).attr("href").substring(1)


			toggleSubView: (view) -> 
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
				console.log 'onTemplateLoad'
				@joinedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/joinedprojects"})
				@joinedProjects.on "reset", @addJoined, @
				@joinedProjects.fetch reset: true

				@ownedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/ownedprojects"})
				@ownedProjects.on "reset", @addOwned, @
				@ownedProjects.fetch reset: true
				

			addJoined:->
				@joinedProjects.each (projectModel) => @addOne projectModel, @followView.find("ul" )

			addOwned:->
				@ownedProjects.each (projectModel) => @addOne projectModel, @manageView.find("ul")

			addOne: (projectModel_, parent_) ->
				view = new ProjectPartialsView(model: projectModel_)
				@$el.find(parent_).append view.$el