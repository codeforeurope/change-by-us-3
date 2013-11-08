define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectUpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/ProjectUpdatesCollection"], 
	(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectUpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, ProjectUpdatesCollection) ->
		CBUProjectView = AbstractView.extend
			isOwner:false
			projectCalenderView: null
			projectMembersView: null
			projectUpdatesView: null
			updatesBTN: null
			membersBTN: null
			calendarBTN: null
			$header:null

			initialize: (options) ->
				console.log 'CBUProjectView options',options
				@templateDir = options.templateDir or @templateDir
				@parent      = options.parent or @parent
				@model       = new ProjectModel(options.model)
				@collection  = options.collection or @collection
				@isOwner     = options.isOwner || @isOwner
				@model.fetch 
					success: =>@render()

			render: -> 
				console.log 'CBUProjectView',@model
				@$el = $("<div class='project-container'/>")
				@$el.template(@templateDir+"/templates/project.html", 
					{}, => @addSubViews())
				$(@parent).append @$el

			addSubViews: ->  
				@$header = $("<div class='project-header'/>")
				@$header.template @templateDir+"/templates/partials-project/project-header.html",
					{data:@model.attributes}, =>
						@$el.prepend @$header

						id = @model.get("id")
						config = {id:id}
						projectUpdatesCollection  = new ProjectUpdatesCollection(config)
						projectMembersCollection   = new ProjectMembersCollection(config)
						projectCalendarCollection = new ProjectCalendarCollection(config)

						@projectUpdatesView   = new ProjectUpdatesView({collection: projectUpdatesCollection})
						@projectMembersView   = new ProjectMembersView({collection: projectMembersCollection})
						@projectCalenderView  = new ProjectCalenderView({collection: projectCalendarCollection})
						
						@updatesBTN  = $("a[href='#updates']").parent()
						@membersBTN  = $("a[href='#members']").parent()
						@calendarBTN = $("a[href='#calendar']").parent()
						
						hash = window.location.hash.substring(1)
						@toggleSubView (if (hash is "") then "updates" else hash)
						$(window).bind "hashchange", (e) =>
							hash = window.location.hash.substring(1)
							@toggleSubView hash

						# temp hack because somewhere this event default is prevented
						$("a[href^='#']").click (e) -> 
							window.location.hash = $(this).attr("href").substring(1)

						@joingBTN() 

			joingBTN:->
				id = @model.get("id")

				joined = false
				$join = $(".project-footer .btn")
				$join.click (e) =>
					e.preventDefault()
					if joined then return
					$.ajax(
						type: "POST"
						url: "/api/project/join"
						data: { project_id:id }
					).done (response)=>
						if response.msg.toLowerCase() is "ok"
							joined = true
							$join.html('Joined')
							$join.css('background-color','#e6e6e6')
				$join.addClass('invisible')

				# determine if user is a member of the project
				# if not, display the join button

				$.ajax(
					type: "GET"
					url: "/api/project/am_i_a_member/"+id
				).done (response)=> 
					console.log 'response.data.member',response,$join

					try if response.data.member is false then $join.removeClass('invisible')
					catch e then console.log e


			toggleSubView: (view) ->
				@projectUpdatesView.hide()
				@projectMembersView.hide()
				@projectCalenderView.hide()

				@updatesBTN.removeClass "active"
				@membersBTN.removeClass "active"
				@calendarBTN.removeClass "active"
				console.log 'toggleSubView',@projectUpdatesView,@updatesBTN

				switch view 
					when "members"
						@projectMembersView.show()
						@membersBTN.addClass "active"
					when "calendar"
						@projectCalenderView.show()
						@calendarBTN.addClass "active"
					else 
						@projectUpdatesView.show()
						@updatesBTN.addClass "active"
