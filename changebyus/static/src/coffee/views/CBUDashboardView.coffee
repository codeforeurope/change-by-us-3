define ["underscore", "backbone", "jquery", "template", "abstract-view", "collection/ProjectListCollection"], 
	(_, Backbone, $, temp, AbstractView, ProjectListCollection) ->

		CBUDashboardView = AbstractView.extend

			initialize: (options) -> 
				@templateDir = options.templateDir or @templateDir
				@parent = options.parent or @parent
				@viewData = options.viewData or @viewData
				@render()

			render: -> 
				@$el.template(@templateDir+"/templates/dashboard.html", 
					{}, => @onTemplateLoad())
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
				@profileView  = $('#edit-profile')
				@followView   = $('#follow-projects')
				
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
