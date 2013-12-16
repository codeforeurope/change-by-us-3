define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"views/partials-project/ProjectCalenderView", 
		"views/partials-project/ProjectMembersView", 
		"views/partials-universal/UpdatesView", 
		"model/ProjectModel", 
		"collection/ProjectCalendarCollection", 
		"collection/ProjectMembersCollection", 
		"collection/ProjectUpdatesCollection"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 AbstractView, 
	 ProjectCalenderView,
	 ProjectMembersView, 
	 UpdatesView, 
	 ProjectModel, 
	 ProjectCalendarCollection, 
	 ProjectMembersCollection, 
	 ProjectUpdatesCollection) ->
	 	
		CBUProjectView = AbstractView.extend
			isOwner:false
			isMember:false
			projectCalenderView: null
			projectMembersView: null
			UpdatesView: null
			updatesBTN: null
			membersBTN: null
			calendarBTN: null
			memberData: null
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

			events:
				"click .flag-project a":"flagProject"
				"click .project-footer .btn":"joinProject"
				"click  a[href^='#']":"changeHash"

			render: ->  
				@$el = $("<div class='project-container'/>")
				@$el.template @templateDir+"/templates/project.html", 
					{}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				# determine if user is a member of the project
				# if not, display the join button
				
				@viewData = @model.attributes

				if window.userID is ""
					@isMember = false
					@addHeaderView()
				else
					id = @model.get("id")
					$.ajax(
						type: "GET"
						url: "/api/project/#{id}/user/#{window.userID}"
					).done (response)=>  
						if response.success
							@memberData = response.data
							@isMember = if true in [@memberData.member, @memberData.organizer, @memberData.owner] then true else false
							@viewData.isMember = @isMember
							@addHeaderView()

			addHeaderView: ->   
				@$header = $("<div class='project-header'/>")
				@$header.template @templateDir+"/templates/partials-project/project-header.html",
					{data:@viewData}, => @onHeaderLoaded()

			onHeaderLoaded:->
				console.log '@model',@model
				id = @model.get("id")
				config = {id:id}

				@$el.prepend @$header
				@projectUpdatesCollection  = new ProjectUpdatesCollection(config)  
				@projectMembersCollection  = new ProjectMembersCollection(config)
				@projectMembersCollection.on "reset", @onCollectionLoad, @
				@projectMembersCollection.fetch {reset: true}

			onCollectionLoad:->  
				@UpdatesView   = new UpdatesView({collection:@projectUpdatesCollection, members:@projectMembersCollection, isMember:@isMember})
				@projectMembersView   = new ProjectMembersView({collection:@projectMembersCollection, isDataLoaded:true, isMember:@isMember})
				@projectCalenderView  = new ProjectCalenderView({model:@model, isMember:@isMember, isOwner:@isOwner})
				
				@updatesBTN  = $("a[href='#updates']").parent()
				@membersBTN  = $("a[href='#members']").parent()
				@calendarBTN = $("a[href='#calendar']").parent()
				
				$(window).bind "hashchange", (e) => @toggleSubView()
				@toggleSubView()

				@delegateEvents()

			flagProject:(e)-> 
				e.preventDefault()
				$this = $(e.currentTarget)
				$this.parent().css('opacity', 0.25)
				url = $this.attr('href')
				$.ajax(
					type: "POST"
					url: url 
				).done (response_)=>
					console.log response_

			joinProject:(e)-> 
				if @isMember then return
				
				if window.userID is ""
					window.location = "/login"
				else
					id = @model.get("id")
					$join  = $(".project-footer .btn")
					e.preventDefault()
					
					$.ajax(
						type: "POST"
						url: "/api/project/join"
						data: {project_id:id}
					).done (response)=>
						if response.success
							@isMember = true
							$join.html('Joined!').css('background-color','#e6e6e6')
			

			toggleSubView: ->
				view = window.location.hash.substring(1)
				
				for v in [@UpdatesView, @projectMembersView, @projectCalenderView]
					v.hide()

				for btn in [@updatesBTN, @membersBTN, @calendarBTN]
					btn.removeClass "active"

				switch view 
					when "members"
						@projectMembersView.show()
						@membersBTN.addClass "active"
					when "calendar"
						@projectCalenderView.show()
						@calendarBTN.addClass "active"
					else 
						@UpdatesView.show()
						@updatesBTN.addClass "active"