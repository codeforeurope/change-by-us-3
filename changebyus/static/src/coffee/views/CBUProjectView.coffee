define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"views/partials-project/ProjectCalenderView", 
		"views/partials-project/ProjectMembersView", 
		"views/partials-universal/UpdatesView",
		"views/partials-universal/WysiwygFormView",
		"model/ProjectModel", 
		"collection/ProjectCalendarCollection", 
		"collection/ProjectMembersCollection", 
		"collection/UpdatesCollection"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 AbstractView, 
	 ProjectCalenderView,
	 ProjectMembersView, 
	 UpdatesView, 
	 WysiwygFormView, 
	 ProjectModel, 
	 ProjectCalendarCollection, 
	 ProjectMembersCollection, 
	 UpdatesCollection) ->
	 	
		CBUProjectView = AbstractView.extend
			isOwner:false
			isMember:false
			isResource:false
			projectCalenderView: null
			projectMembersView: null
			updatesView: null
			updatesBTN: null
			membersBTN: null
			calendarBTN: null
			memberData: null
			$header:null

			initialize: (options) -> 
				@templateDir = options.templateDir or @templateDir
				@parent      = options.parent or @parent
				@model       = new ProjectModel(options.model)
				@collection  = options.collection or @collection
				@isOwner     = options.isOwner || @isOwner
				@isResource  = options.isResource || @isResource
				@model.fetch 
					success: =>@render()

			events:
				"click .flag-project a":"flagProject"
				"click .project-footer .btn":"joinProject"
				"click  a[href^='#']":"changeHash"

			render: ->
				# @isResource = @model.get("resource")

				if @isResource
					className = "resource-container"
					templateURL = "/templates/resource.html"
				else
					className = "project-container"
					templateURL = "/templates/project.html"

				@$el = $("<div class='#{className}'/>")
				@$el.template @templateDir+templateURL, 
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
				if @isResource
					className = "resource-header"
					templateURL = "/templates/partials-resource/resource-header.html"
				else
					className = "project-header"
					templateURL = "/templates/partials-project/project-header.html"

				@$header = $("<div class='#{className}'/>")
				@$header.template @templateDir+templateURL, 
					{data:@viewData}, => @onHeaderLoaded()
				@$el.prepend @$header

			onHeaderLoaded:->
				id = @model.get("id")
				config = {id:id}

				@updatesCollection  = new UpdatesCollection(config)  
				@projectMembersCollection  = new ProjectMembersCollection(config)
				@projectMembersCollection.on "reset", @onCollectionLoad, @
				@projectMembersCollection.fetch {reset: true}

			onCollectionLoad:->  
				parent       = if @isResource then "#resource-updates" else "#project-updates"
				@updatesView = new UpdatesView({collection:@updatesCollection, members:@projectMembersCollection, isMember:@isMember, isResource:@isResource, parent:parent})

				if @isResource
					@updatesView.show()
					@updatesView.on 'ON_TEMPLATE_LOAD', =>
						userAvatar = $('.profile-nav-header img').attr('src')
						@wysiwygFormView = new WysiwygFormView({parent:"#add-resource-update", id:@model.get("id"), slim:true, userAvatar:userAvatar})
					console.log 'wysiwygFormView',@wysiwygFormView
				else
					@projectMembersView  = new ProjectMembersView({collection:@projectMembersCollection, isDataLoaded:true, isMember:@isMember})
					@projectCalenderView = new ProjectCalenderView({model:@model, isMember:@isMember, isOwner:@isOwner})
					
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
							feedback = if @isResource then 'Following!' else'Joined!'
							@isMember = true
							$join.html(feedback).css('background-color','#e6e6e6')
			

			toggleSubView: ->
				view = window.location.hash.substring(1)
				
				for v in [@updatesView, @projectMembersView, @projectCalenderView]
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
						@updatesView.show()
						@updatesBTN.addClass "active"