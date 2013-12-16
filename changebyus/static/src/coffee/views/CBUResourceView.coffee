define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"abstract-view", 
		"model/ResourceModel",
		"collection/ResourceUpdatesCollection"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 AbstractView, 
	 ResourceModel,
	 ResourceUpdatesCollection) ->
	 	
		CBUProjectView = AbstractView.extend
			isMember:false
			$header:null

			initialize: (options) ->
				@templateDir = options.templateDir or @templateDir
				@parent      = options.parent or @parent
				@model       = new ResourceModel(options.model)
				@collection  = options.collection or @collection
				@model.fetch 
					success: =>@render()

			events: 
				"click .resource-footer .btn":"followResource" 

			render: ->  
				@$el = $("<div class='resource-container'/>")
				@$el.template @templateDir+"/templates/resource.html", 
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
						url: "/api/resource/#{id}/user/#{window.userID}"
					).done (response)=>  
						if response.success
							@memberData = response.data
							@isMember = if true in [@memberData.member, @memberData.organizer, @memberData.owner] then true else false
							@viewData.isMember = @isMember
							@addHeaderView()

			addHeaderView: ->   
				@$header = $("<div class='project-header'/>")
				@$header.template @templateDir+"/templates/partials-resource/resource-header.html",
					{data:@viewData}, => @onHeaderLoaded()

			onHeaderLoaded:-> 
				id = @model.get("id")
				config = {id:id}

				@$el.prepend @$header

				@resourceUpdatesCollection  = new ResourceUpdatesCollection(config)
				@resourceUpdatesCollection.on "reset", @onCollectionLoad, @
				@resourceUpdatesCollection.fetch {reset: true}

			onCollectionLoad:-> 
				@addAll()
				@delegateEvents()

			addAll: ->
				if @collection.models.length is 0
					@$el.template @templateDir+"/templates/partials-project/project-zero-discussions.html", 
						{}, => onPageElementsLoad()
				else
					@loadDayTemplate()

			loadDayTemplate:->
				@$day = $('<div />')
				@$day.template @templateDir+"/templates/partials-project/project-entries-day-wrapper.html",
					{}, =>
						if @collection.length > 0
							model_ = @collection.models[0]
							m = moment(model_.get("updated_at")).format("MMMM D")
							@newDay(m)

						@isDataLoaded = true

						ProjectSubView::addAll.call(@) 

			newDay:(date_)->
				@currentDate = date_
				@$currentDay = @$day.clone()
				@$el.append @$currentDay
				@$currentDay.find('h4').html(date_)
				@$ul = @$currentDay.find('.bordered-item') 

			addOne:(model_)->
				m = moment(model_.get("updated_at")).format("MMMM D")
				if @currentDate isnt m then @newDay(m)

				config = {model:model_}
				projectDiscussionListItemView = new ProjectDiscussionListItemView(config) 
				projectDiscussionListItemView.on 'click', =>
					@trigger 'discussionClick', config

				@$ul.append projectDiscussionListItemView.$el

				onPageElementsLoad()


			followResource:(e)-> 
				if @isMember then return
				
				if window.userID is ""
					window.location = "/login"
				else
					id = @model.get("id")
					$join  = $(".project-footer .btn")
					e.preventDefault()
					
					$.ajax(
						type: "POST"
						url: "/api/resource/join"
						data: {project_id:id}
					).done (response)=>
						if response.success
							@isMember = true
							$join.html('Joined!').css('background-color','#e6e6e6')