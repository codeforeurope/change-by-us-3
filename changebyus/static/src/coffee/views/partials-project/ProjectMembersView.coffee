define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectMemberListItemView"],
	(_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) ->
		ProjectMembersView = ProjectSubView.extend
		
			parent: "#project-members"
			team:[]
			members:[]
			$teamList: null
			$memberList: null

			initialize: (options) -> 
				@isDataLoaded = options.isDataLoaded || @isDataLoaded
				ProjectSubView::initialize.call(@, options)

			render: ->  
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-members.html", 
					{}, => @onTemplateLoad()

			onTemplateLoad:->
				@$el.find(".preload").remove()
				@$teamList = @$el.find("#team-members ul")
				@$memberList = @$el.find("#project-members ul")
				@addAll()

			# override in subview
			addAll: -> 
				console.log 'ProjectMembersView ',@
				if @collection.models.length is 0 then @noResults() else @$el.find(".preload").remove()

				###
				@collection.models[0].attributes.roles = ["Project Owner"]
				@collection.models[0].attributes.description = "Lorem ipsum"

				@collection.models[1].attributes.roles = ["Organizer"]
				@collection.models[1].attributes.description = "Tempor cray proident, stumptown hella"
				@collection.models[1].attributes.email = "mattlohmann@localprojects.net"
				
				@collection.models[2].attributes.roles = ["Member"]
				@collection.models[2].attributes.description = "Master cleanse plaid assumenda"
				###

				@collection.each (model) => 
					if "Project Owner" in model.attributes.roles or "Organizer" in model.attributes.roles
						@team.push model
					else
						@members.push model
					console.log 'ProjectMembersView model.roles',model

				@addTeam(model) for model in @team
				@addMember(model) for model in @members

				if @members.length > 0 then @$memberList.parent().show()

				@isDataLoaded = true


			addTeam: (model_) -> 
				#to do 
				console.log 'addTeam model_',model_
				view = new ProjectMemberListItemView({model:model_})
				@$teamList.append view.el

			addMember: (model_) -> 
				#to do 
				console.log 'addMember model_',model_
				view = new ProjectMemberListItemView({model:model_})
				@$memberList.append view.el
