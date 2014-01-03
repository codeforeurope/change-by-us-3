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
			className: "body-container"
			currentView:""

			initialize: (options) ->  
				AbstractView::initialize.call @, options
				@userModel = new UserModel(id:@model.id)
				@userModel.fetch 
					success: =>@render() 

			events:
				"click a[href^='#']":"changeHash"

			render: ->  
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

				profileEditView = new ProfileEditView({model:@userModel, parent:@profileView})


			toggleSubView: -> 
				@currentView = window.location.hash.substring(1)

				for v in [@manageView,@profileView,@followView]
					v.hide()

				for btn in [@followBTN,@profileBTN,@manageBTN]
					btn.removeClass "active"

				switch @currentView 
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
				@joinedProjects = new ProjectListCollection()
				@joinedProjects.url = "/api/project/user/#{@model.id}/joined-projects"
				@joinedProjects.on "reset", @addJoined, @
				@joinedProjects.on "remove", @updateCount, @
				@joinedProjects.on "change", @updateCount, @
				@joinedProjects.fetch reset: true

				@ownedProjects = new ProjectListCollection()
				@ownedProjects.url = "/api/project/user/#{@model.id}/owned-projects"
				@ownedProjects.on "reset", @addOwned, @
				@ownedProjects.on "remove", @updateCount, @
				@ownedProjects.on "change", @updateCount, @
				@ownedProjects.fetch reset: true

			updateCount:->
				$('a[href=#follow]').html "Follow (#{@joinedProjects.length})"
				$('a[href=#manage]').html "Manage (#{@ownedProjects.length})"

			addJoined:->
				@updateCount() 
				@updateProjects(@joinedProjects.models, @followView.find(".projects"))
				@setPages @joinedProjects.length, @followView

			addOwned:->
				@updateCount() 
				@updateProjects(@ownedProjects.models, @manageView.find(".projects"))
				@setPages @ownedProjects.length, @manageView

			updatePage:->
				if @currentView is "follow"
					$ul = @followView.find(".projects")
					$ul.html("")
					@updateProjects(@joinedProjects.models, $ul)
				else
					$ul = @manageView.find(".projects")
					$ul.html("")
					@updateProjects(@ownedProjects.models, $ul)

				$("html, body").animate({ scrollTop: 0 }, "slow")

			updateProjects:(results_, parent_)->
				console.log 'updatePage',results_,parent_
				s = @index*@perPage
				e = (@index+1)*@perPage-1
				for i in [s..e]
					if i < results_.length
						projectModel = results_[i]
						@addOne(projectModel, parent_, false, true)

			addOne: (projectModel_, parent_, isOwned_=false, isFollowed_=false) ->
				view = new ResourceProjectPreviewView
					model: projectModel_
					isOwned: isOwned_
					isFollowed: isFollowed_
					isProject: true
					isResource: false

				parent_.append view.$el
				
				###
				delay 100, ->
					buttonize3D()
					positionFooter()
				###
