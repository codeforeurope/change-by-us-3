define ["underscore", "backbone", "jquery", "template", "project-view"], 
	(_, Backbone, $, temp, CBUProjectView) ->
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
						id = {id:@model.get("id")}
						#projectUpdatesCollection  = new ProjectUpdatesCollection(id)
						#projectMembersCollection   = new ProjectMembersCollection(id)
						#projectCalendarCollection = new ProjectCalendarCollection(id)

						#@projectUpdatesView   = new ProjectUpdatesView({collection: projectUpdatesCollection}) 
						#@projectMembersView   = new ProjectMembersView({collection: projectMembersCollection})
						#@projectCalenderView  = new ProjectCalenderView({collection: projectCalendarCollection})
						
						@discussionBTN  = $("a[href='#discussion']")
						@updatesBTN     = $("a[href='#updates']")
						@fundraisingBTN = $("a[href='#fundraising']") 
						@calendarBTN    = $("a[href='#calendar']")
						@membersBTN     = $("a[href='#members']")
						@infoBTN        = $("a[href='#info']")
						
						@projectMembersView.hide()
						@projectCalenderView.hide()
						
						hash = window.location.hash.substring(1)
						@toggleSubView (if (hash is "") then "updates" else hash)
						$(window).bind "hashchange", (e) =>
							hash = window.location.hash.substring(1)
							@toggleSubView hash
						
						# temp hack because somewhere this event default is prevented
						$("a[href^='#']").click (e) -> 
							window.location.hash = $(this).attr("href").substring(1)

				@$el.prepend $header

			toggleSubView: (view) ->
				@projectUpdatesView.hide()
				@projectMembersView.hide()
				@projectCalenderView.hide()

				@discussionBTN.removeClass "active"
				@updatesBTN.removeClass "active"
				@fundraisingBTN.removeClass "active" 
				@calendarBTN.removeClass "active"
				@membersBTN.removeClass "active"
				@infoBTN.removeClass "active"

				switch view
					when "discussion"
						console.log ''
					when "updates"
						@projectUpdatesView.show()
						@updatesBTN.addClass "active"
					when "fundraising"
						console.log ''
					when "calendar"
						@projectCalenderView.show()
						@calendarBTN.addClass "active" 
					when "members"
						@projectMembersView.show()
						@membersBTN.addClass "active"
					when "info"
						console.log '' 