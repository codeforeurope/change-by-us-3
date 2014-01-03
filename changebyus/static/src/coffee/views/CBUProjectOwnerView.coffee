define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"project-view", 
		"model/ProjectModel", 
		"collection/ProjectDiscussionsCollection", 
		"collection/UpdatesCollection", 
		"collection/ProjectCalendarCollection", 
		"collection/ProjectMembersCollection", 
		"views/partials-project/ProjectDiscussionView", 
		"views/partials-project/ProjectDiscussionsView", 
		"views/partials-project/ProjectNewDiscussionView", 
		"views/partials-project/ProjectFundraisingView", 
		"views/partials-project/ProjectAddUpdateView", 
		"views/partials-project/ProjectCalenderView", 
		"views/partials-project/ProjectMembersView", 
		"views/partials-project/ProjectInfoAppearanceView"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 CBUProjectView, 
	 ProjectModel,
	 ProjectDiscussionsCollection, 
	 UpdatesCollection, 
	 ProjectCalendarCollection, 
	 ProjectMembersCollection, 
	 ProjectDiscussionView, 
	 ProjectDiscussionsView, 
	 ProjectNewDiscussionView, 
	 ProjectFundraisingView, 
	 ProjectAddUpdateView, 
	 ProjectCalenderView, 
	 ProjectMembersView, 
	 ProjectInfoAppearanceView) ->

		CBUProjectOwnerView = CBUProjectView.extend

			initialize: (options) -> 
				@templateDir = options.templateDir or @templateDir
				@parent      = options.parent or @parent
				@model       = new ProjectModel(options.model)
				@collection  = options.collection or @collection
				@isOwner     = options.isOwner || @isOwner
				@isResource  = options.isResource || @isResource
				@model.fetch 
					success: =>@getMemberStatus()

			events:
				"click a[href^='#']":"changeHash"

			getMemberStatus:->
				id = @model.get("id")
				$.get "/api/project/#{id}/user/#{window.userID}", (res_)=>  
					if res_.success
						console.log 'res_',res_, @model
						@memberData = res_.data

						if (@memberData.organizer || @memberData.owner) then @render() else (window.location.href = "/project/"+@model.get("slug"))

			render: -> 
				@$el = $("<div class='project-container'/>")
				@$el.template @templateDir+"/templates/project-owner.html", 
					{}, => @onTemplateLoad()
				$(@parent).append @$el 
				
			onTemplateLoad: -> 
				@$header = $("<div class='project-header'/>")
				@$header.template @templateDir + "/templates/partials-project/project-owner-header.html",
					{data:@model.attributes}, =>@addSubViews()
						
			addSubViews:->
				config = {id:@model.get("id"), name:@model.get("name"), model:@model, isOwner:@memberData.owner, isOrganizer:@memberData.organizer ,view:"admin"} 

				projectDiscussionsCollection = new ProjectDiscussionsCollection(config)  
				projectMembersCollection     = new ProjectMembersCollection(config)
				updatesCollection            = new UpdatesCollection(config)
				
				@projectDiscussionsView    = new ProjectDiscussionsView({collection: projectDiscussionsCollection})
				@projectDiscussionView     = new ProjectDiscussionView()
				@projectNewDiscussionView  = new ProjectNewDiscussionView(config) 
				@projectAddUpdateView      = new ProjectAddUpdateView({collection: updatesCollection, model:@model})
				@projectFundraisingView    = new ProjectFundraisingView(config) 
				@projectCalenderView       = new ProjectCalenderView(config) 
				@projectMembersView        = new ProjectMembersView({collection: projectMembersCollection, view:"admin", projectID:@model.id})
				@projectInfoAppearanceView = new ProjectInfoAppearanceView(config)

				@projectDiscussionsView.on 'discussionClick', (arg_)=> 
					window.location.hash = "discussion/"+arg_.model.id
				
				@discussionBTN  = $("a[href='#discussions']")
				@updatesBTN     = $("a[href='#updates']")
				@fundraisingBTN = $("a[href='#fundraising']") 
				@calendarBTN    = $("a[href='#calendar']")
				@membersBTN     = $("a[href='#members']")
				@infoBTN        = $("a[href='#info']")
				
				$(window).bind "hashchange", (e) => @toggleSubView()
				@toggleSubView() 

				@delegateEvents()
							
				@$el.prepend @$header

			toggleSubView: -> 

				view = window.location.hash.substring(1)
				slug = @model.get('slug')

				stripeAccount = @model.get("stripe_account")
				 
				if stripeAccount and view is "fundraising"
					window.location.hash = ""
					window.location.href = "/project/#{slug}/fundraising"
					return

				for v in [@projectDiscussionsView, @projectDiscussionView, @projectNewDiscussionView, @projectAddUpdateView, @projectFundraisingView, @projectCalenderView, @projectMembersView, @projectInfoAppearanceView]
					v.hide()

				for btn in [@discussionBTN, @updatesBTN, @fundraisingBTN, @calendarBTN, @membersBTN, @infoBTN]
					btn.removeClass "active"

				if view.indexOf("discussion/") > -1
					id = view.split('/')[1]
					@projectDiscussionView.updateDiscussion(id)
					@projectDiscussionView.show()
					@discussionBTN.addClass "active"
					return

				switch view 
					when "new-discussion" 
						@projectNewDiscussionView.show()
						@discussionBTN.addClass "active"
					when "updates"
						@projectAddUpdateView.show()
						@updatesBTN.addClass "active"
					when "fundraising"
						@projectFundraisingView.show()
						@fundraisingBTN.addClass "active" 
					when "calendar"
						@projectCalenderView.show()
						@calendarBTN.addClass "active" 
					when "members"
						@projectMembersView.show()
						@membersBTN.addClass "active"
					when "info"
						@projectInfoAppearanceView.show()
						@infoBTN.addClass "active"
					else
						@projectDiscussionsView.show()
						@discussionBTN.addClass "active" 