define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"project-view", 
		"collection/ProjectDiscussionsCollection", 
		"collection/ProjectUpdatesCollection", 
		"collection/ProjectCalendarCollection", 
		"collection/ProjectMembersCollection", 
		"views/partials-project/ProjectDiscussionsView", 
		"views/partials-project/ProjectNewDiscussionView", 
		"views/partials-project/ProjectFundraisingView", 
		"views/partials-project/ProjectAddUpdateView", 
		"views/partials-project/ProjectCalenderView", 
		"views/partials-project/ProjectMembersView", 
		"views/partials-project/ProjectInfoAppearanceView"], (_, 
																Backbone, 
																$, 
																temp, 
																CBUProjectView, 
																ProjectDiscussionsCollection, 
																ProjectUpdatesCollection, 
																ProjectCalendarCollection, 
																ProjectMembersCollection, 
																ProjectDiscussionsView, 
																ProjectNewDiscussionView, 
																ProjectFundraisingView, 
																ProjectAddUpdateView, 
																ProjectCalenderView, 
																ProjectMembersView, 
																ProjectInfoAppearanceView) ->

		CBUProjectOwnerView = CBUProjectView.extend

			initialize: (options) ->
				# console.log 'CBUProjectOwnerView',options
				CBUProjectView::initialize.call @, options

			render: -> 
				@$el = $("<div class='project-container'/>")
				@$el.template(@templateDir+"/templates/project-owner.html", {}
					, => @addSubViews())
				$(@parent).append @$el

			addSubViews: ->  
				$header = $("<div class='project-header'/>")
				$header.template @templateDir + "/templates/partials-project/project-owner-header.html",
					{data:@model.attributes}, =>
						id = {id:@model.get("id"), name:@model.get("name")}
						# TO DO
						# create all the subpage classes and HTML templates

						projectDiscussionsCollection = new ProjectDiscussionsCollection(id) 
						projectCalendarCollection    = new ProjectCalendarCollection(id)
						projectMembersCollection     = new ProjectMembersCollection(id)
						
						@projectDiscussionsView    = new ProjectDiscussionsView({collection: projectDiscussionsCollection, parent:"#project-discussion"}) 
						@projectNewDiscussionView  = new ProjectNewDiscussionView() 
						@projectAddUpdateView      = new ProjectAddUpdateView()
						@projectFundraisingView    = new ProjectFundraisingView(id) 
						@projectCalenderView       = new ProjectCalenderView({collection: projectCalendarCollection})
						@projectMembersView        = new ProjectMembersView({collection: projectMembersCollection})
						@projectInfoAppearanceView = new ProjectInfoAppearanceView()
						
						@discussionBTN  = $("a[href='#discussion']")
						@updatesBTN     = $("a[href='#updates']")
						@fundraisingBTN = $("a[href='#fundraising']") 
						@calendarBTN    = $("a[href='#calendar']")
						@membersBTN     = $("a[href='#members']")
						@infoBTN        = $("a[href='#info']")
						
						hash = window.location.hash.substring(1)
						@toggleSubView (if (hash is "") then "discussion" else hash)
						$(window).bind "hashchange", (e) =>
							hash = window.location.hash.substring(1)
							@toggleSubView hash
						
						# temp hack because somewhere this event default is prevented
						$("a[href^='#']").click (e) -> 
							window.location.hash = $(this).attr("href").substring(1)

				@$el.prepend $header

			toggleSubView: (view_) -> 
				for view in [@projectDiscussionsView, @projectNewDiscussionView, @projectAddUpdateView, @projectFundraisingView, @projectCalenderView, @projectMembersView, @projectInfoAppearanceView]
					view.hide()

				for btn in [@discussionBTN, @updatesBTN, @fundraisingBTN, @calendarBTN, @membersBTN, @infoBTN]
					btn.removeClass "active"
 
				switch view_
					when "discussion" 
						@projectDiscussionsView.show()
						@discussionBTN.addClass "active"
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