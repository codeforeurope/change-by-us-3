define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"project-view", 
		"collection/ProjectDiscussionsCollection", 
		"collection/ProjectUpdatesCollection", 
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
	 ProjectDiscussionsCollection, 
	 ProjectUpdatesCollection, 
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
				CBUProjectView::initialize.call @, options
				console.log 'CBUProjectOwnerView',@

			render: -> 
				@$el = $("<div class='project-container'/>")
				@$el.template @templateDir+"/templates/project-owner.html", 
					{}, => @addSubViews()
				$(@parent).append @$el

			addSubViews: ->
				console.log 'addSubViews',@model.attributes
				$header = $("<div class='project-header'/>")
				$header.template @templateDir + "/templates/partials-project/project-owner-header.html",
					{data:@model.attributes}, =>
						
						config = {id:@model.get("id"), name:@model.get("name"), model:@model,isOwner:true} 
	

						projectDiscussionsCollection = new ProjectDiscussionsCollection(config)  
						projectMembersCollection     = new ProjectMembersCollection(config)
						projectUpdatesCollection     = new ProjectUpdatesCollection(config)
						
						@projectDiscussionsView    = new ProjectDiscussionsView({collection: projectDiscussionsCollection})
						@projectDiscussionView     = new ProjectDiscussionView()
						@projectNewDiscussionView  = new ProjectNewDiscussionView(config) 
						@projectAddUpdateView      = new ProjectAddUpdateView({collection: projectUpdatesCollection})
						@projectFundraisingView    = new ProjectFundraisingView(config) 
						@projectCalenderView       = new ProjectCalenderView(config) 
						@projectMembersView        = new ProjectMembersView({collection: projectMembersCollection})
						@projectInfoAppearanceView = new ProjectInfoAppearanceView(config)

						@projectDiscussionsView.on 'discussionClick', (arg_)=>
							console.log 'projectDiscussionsView arg_',arg_
							@projectDiscussionView.updateDiscussion(arg_.model)
							window.location.hash = "discussion/"+arg_.model.id

						###
						@projectDiscussionsView.on 'deleteDiscussion', (arg_)=>
							console.log 'deleteDiscussion arg_',arg_ 
						###
						
						@discussionBTN  = $("a[href='#discussions']")
						@updatesBTN     = $("a[href='#updates']")
						@fundraisingBTN = $("a[href='#fundraising']") 
						@calendarBTN    = $("a[href='#calendar']")
						@membersBTN     = $("a[href='#members']")
						@infoBTN        = $("a[href='#info']")
						
						$(window).bind "hashchange", (e) => @toggleSubView()
						@toggleSubView()
						
						# temp hack because somewhere this event default is prevented
						$("a[href^='#']").click (e) -> 
							window.location.hash = $(this).attr("href").substring(1)

				@$el.prepend $header

			toggleSubView: -> 
				view = window.location.hash.substring(1)

				for v in [@projectDiscussionsView, @projectDiscussionView, @projectNewDiscussionView, @projectAddUpdateView, @projectFundraisingView, @projectCalenderView, @projectMembersView, @projectInfoAppearanceView]
					v.hide()

				for btn in [@discussionBTN, @updatesBTN, @fundraisingBTN, @calendarBTN, @membersBTN, @infoBTN]
					btn.removeClass "active"
				console.log 'view', (view.indexOf("discussion/")>-1)

				if view.indexOf("discussion/") > -1
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
						# "discussions" 
						@projectDiscussionsView.show()
						@discussionBTN.addClass "active" 