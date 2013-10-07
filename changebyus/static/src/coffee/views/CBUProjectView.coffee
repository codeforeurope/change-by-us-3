define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectUpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMemberCollection", "collection/ProjectUpdatesCollection"], 
	(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectUpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMemberCollection, ProjectUpdatesCollection) ->
		CBUProjectView = AbstractView.extend(
			projectCalenderView: null
			projectMembersView: null
			projectUpdatesView: null
			updatesBTN: null
			membersBTN: null
			calendarBTN: null

			initialize: (options) ->
				self = this
				@templateDir = options.templateDir or @templateDir
				@parent      = options.parent or @parent
				@model       = new ProjectModel(options.model)
				@collection  = options.collection or @collection
				@model.fetch success: ->
					self.render()

			render: ->
				self = this
				@$el = $("<div class='project-container'/>")
				@$el.template @templateDir + "/templates/project.html", {}, ->
					self.addSubViews()

				$(@parent).append @$el

			addSubViews: ->
				self = this
				$header = $("<div class='project-header'/>")
				$header.template @templateDir + "/templates/partials-project/project-header.html",
					data: @model.attributes
				, ->
					id = {id:self.model.get("id")}
					projectUpdatesCollection  = new ProjectUpdatesCollection(id)
					projectMemberCollection   = new ProjectMemberCollection(id)
					projectCalendarCollection = new ProjectCalendarCollection(id)

					self.projectUpdatesView   = new ProjectUpdatesView({collection: projectUpdatesCollection})
					self.projectMembersView   = new ProjectMembersView({collection: projectMemberCollection})
					self.projectCalenderView  = new ProjectCalenderView({collection: projectCalendarCollection})
					
					self.updatesBTN  = $("a[href='#updates']")
					self.membersBTN  = $("a[href='#members']")
					self.calendarBTN = $("a[href='#calendar']")
					
					self.projectMembersView.hide()
					self.projectCalenderView.hide()
					
					hash = window.location.hash.substring(1)
					self.toggleSubView (if (hash is "") then "updates" else hash)
					$(window).bind "hashchange", (e) ->
						hash = window.location.hash.substring(1)
						self.toggleSubView hash
					
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
		)
		CBUProjectView

