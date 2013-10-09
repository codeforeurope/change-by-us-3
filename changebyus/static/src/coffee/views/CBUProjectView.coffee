define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectUpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/ProjectUpdatesCollection"], 
	(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectUpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, ProjectUpdatesCollection) ->
		CBUProjectView = AbstractView.extend
			projectCalenderView: null
			projectMembersView: null
			projectUpdatesView: null
			updatesBTN: null
			membersBTN: null
			calendarBTN: null

			initialize: (options) ->
				console.log 'CBUProjectView options',options
				@templateDir = options.templateDir or @templateDir
				@parent      = options.parent or @parent
				@model       = new ProjectModel(options.model)
				@collection  = options.collection or @collection
				@model.fetch 
					success: =>@render()

			render: -> 
				@$el = $("<div class='project-container'/>")
				@$el.template(@templateDir+"/templates/project.html", {}
					, => @addSubViews())
				$(@parent).append @$el

			addSubViews: ->  
				$header = $("<div class='project-header'/>")
				$header.template @templateDir + "/templates/partials-project/project-header.html",
					data: @model.attributes
				, =>
					id = {id:@model.get("id")}
					projectUpdatesCollection  = new ProjectUpdatesCollection(id)
					projectMembersCollection   = new ProjectMembersCollection(id)
					projectCalendarCollection = new ProjectCalendarCollection(id)

					@projectUpdatesView   = new ProjectUpdatesView({collection: projectUpdatesCollection})
					@projectMembersView   = new ProjectMembersView({collection: projectMembersCollection})
					@projectCalenderView  = new ProjectCalenderView({collection: projectCalendarCollection})
					
					@updatesBTN  = $("a[href='#updates']")
					@membersBTN  = $("a[href='#members']")
					@calendarBTN = $("a[href='#calendar']")
					
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

				@updatesBTN.removeClass "active"
				@membersBTN.removeClass "active"
				@calendarBTN.removeClass "active"

				switch view
					when "updates"
						@projectUpdatesView.show()
						@updatesBTN.addClass "active"
					when "members"
						@projectMembersView.show()
						@membersBTN.addClass "active"
					when "calendar"
						@projectCalenderView.show()
						@calendarBTN.addClass "active" 
