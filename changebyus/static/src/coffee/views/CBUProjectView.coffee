define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"views/partials-project/ProjectCalenderView", 
		"views/partials-project/ProjectMembersView", 
		"views/partials-project/ProjectUpdatesView", 
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
	 ProjectUpdatesView, 
	 ProjectModel, 
	 ProjectCalendarCollection, 
	 ProjectMembersCollection, 
	 ProjectUpdatesCollection) ->
	 	
		CBUProjectView = AbstractView.extend
			isOwner:false
			isMember:false
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
				@$el.template @templateDir+"/templates/project.html", 
					{}, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				# determine if user is a member of the project
				# if not, display the join button
				
				###
				id = @model.get("id")
				$.ajax(
					type: "GET"
					url: "/api/project/am_i_a_member/"+id
				).done (response)=> 
					try 
						if response.data.member
							@isMember=true 

					catch e then console.log e

					@viewData = @model.attributes
					@viewData.isMember = @isMember

					@addSubViews()
				###
				
				@viewData = @model.attributes
				@addSubViews()

			addSubViews: ->  
				@$header = $("<div class='project-header'/>")
				@$header.template @templateDir+"/templates/partials-project/project-header.html",
					{data:@viewData}, => @onHeaderLoaded()

			onHeaderLoaded:->
				id = @model.get("id")
				config = {id:id}

				if @isMember is false then @$header.find('.invisible').removeClass('invisible')
 
				@$el.prepend @$header
				@projectUpdatesCollection  = new ProjectUpdatesCollection(config)  
				@projectMembersCollection  = new ProjectMembersCollection(config)
				@projectMembersCollection.on "reset", @onCollectionLoad, @
				@projectMembersCollection.fetch {reset: true}

			onCollectionLoad:->  
				@projectUpdatesView   = new ProjectUpdatesView({collection:@projectUpdatesCollection, members:@projectMembersCollection, isMember:@isMember})
				@projectMembersView   = new ProjectMembersView({collection:@projectMembersCollection, isDataLoaded:true, isMember:@isMember})
				@projectCalenderView  = new ProjectCalenderView({model:@model, isMember:@isMember, isOwner:@isOwner})
				
				@updatesBTN  = $("a[href='#updates']").parent()
				@membersBTN  = $("a[href='#members']").parent()
				@calendarBTN = $("a[href='#calendar']").parent()
				
				$(window).bind "hashchange", (e) => @toggleSubView()
				@toggleSubView()

				# temp hack because somewhere this event default is prevented
				$("a[href^='#']").click (e) -> 
					window.location.hash = $(this).attr("href").substring(1)

				@btnListeners() 

			btnListeners:->
				$('.flag-project a').click (e)->
					e.preventDefault()
					$this = $(this)
					$this.parent().css('opacity', 0.25)
					url = $this.attr('href')
					$.ajax(
						type: "POST"
						url: url 
					).done (response_)=>
						console.log response_

				id = @model.get("id")

				$join  = $(".project-footer .btn")
				$join.click (e) =>
					e.preventDefault()
					if @isMember then return
					$.ajax(
						type: "POST"
						url: "/api/project/join"
						data: { project_id:id }
					).done (response)=>
						if response.msg.toLowerCase() is "ok"
							@isMember = true
							$join.html('Joined!').css('background-color','#e6e6e6')

			toggleSubView: -> 
				view = window.location.hash.substring(1)
				
				for v in [@projectUpdatesView, @projectMembersView, @projectCalenderView]
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
						@projectUpdatesView.show()
						@updatesBTN.addClass "active"
