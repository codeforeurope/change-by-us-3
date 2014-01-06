define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectMemberListItemView"],
	(_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) ->
		ProjectMembersView = ProjectSubView.extend
		
			parent: "#project-members"
			team:[]
			members:[]
			$teamList: null
			$memberList: null
			projectID:0
			isOwnerOrganizer:false
			view:"public"

			initialize: (options) ->
				@isDataLoaded     = options.isDataLoaded || @isDataLoaded
				@view             = options.view || @view
				@projectID        = options.projectID || @projectID
				@model            = options.model || @model
				@isOwnerOrganizer = options.isOwnerOrganizer || @isOwnerOrganizer

				ProjectSubView::initialize.call(@, options) 

			events:
				"click #alpha":"sortClick" 
				"click #created":"sortClick" 

			render: ->
				console.log 'rr',@
				@$el = $(@parent)
				@viewData = if @model then @model.attributes else {}
				@viewData.isOwnerOrganizer = @isOwnerOrganizer
				templateURL = if (@view is "public") then "/templates/partials-project/project-members.html" else "/templates/partials-project/project-members-admin.html"
				@$el.template @templateDir+templateURL, 
					{data:@viewData}, => @onTemplateLoad() 

			sortClick:(e)-> 
				#if ($(e.currentTarget).attr("id") is "alpha") then @addAll("alpha") else @addAll("created")
				@addAll $(e.currentTarget).attr("id")
				false

			onTemplateLoad:->  
				ProjectSubView::onTemplateLoad.call @
				
				@$teamList   = @$el.find("#team-members ul")
				@$memberList = @$el.find("#project-members ul")

				if (@view is "public") and (@collection.length > 0) then @onCollectionLoad()

				onPageElementsLoad() 

			onCollectionLoad:->
				ProjectSubView::onCollectionLoad.call(@)

				@collection.on('change', =>@addAll()) 
				@collection.on('remove', =>@addAll())

			# override in subview
			addAll: (sort_="alpha") -> 
				@team = []
				@members = []

				$("#"+sort_)
					.addClass('sort-deactive')
					.removeClass('ul')
					.siblings()
					.removeClass('sort-deactive')
					.addClass('ul')

				console.log $("#"+sort_),sort_

				if sort_ is "alpha"
					sortBy = @collection.sortBy (model)->
						model.get('last_name')
				else
					sortBy = @collection.sortBy (model)->
						model.get('created_at')

				$.each sortBy, (k, model) =>
					console.log 'alpha model',model.get('last_name'),model
					roles = model.get("roles")
					ownerID = @model.get('owner').id
					 
					if roles.length is 0 
						model.set("roles", ["Owner"]) 

					if ("MEMBER" in roles) or ("Member" in roles)
						@members.push model
					else
						# don't include the owner when logged in order to display invite for new members
						if (model.id isnt ownerID)
							@team.push model
						else
							if (window.userID isnt ownerID)
								@team.push model

				@$teamList.html('')
				@$memberList.html('')

				if @team.length is 0 
					@$teamList.parent().parent().hide()
				else
					@$teamList.parent().parent().show()
					@$teamList.parent().parent().find('h4').html(@team.length+' Person Team')

				if @members.length is 0
					@$memberList.parent().parent().hide()
				else
					@$memberList.parent().parent().show()
					@$memberList.parent().parent().find('h4').html(@members.length+' Members')
				
				console.log('team >>>>>>>>>> ',@team, @members)
				
				if (@team.length is 0) and (@members.length is 0)
					$('.no-results').show()

				else
					@addTeam(model) for model in @team
					@addMember(model) for model in @members
					ProjectSubView::addAll.call(@)

				@isDataLoaded = true
				@delegateEvents()

			addTeam: (model_) -> 
				#to do 
				view = new ProjectMemberListItemView({model:model_, view:@view, projectID:@projectID})
				@$teamList.append view.el

			addMember: (model_) -> 
				#to do 
				view = new ProjectMemberListItemView({model:model_, view:@view, projectID:@projectID})
				@$memberList.append view.el
