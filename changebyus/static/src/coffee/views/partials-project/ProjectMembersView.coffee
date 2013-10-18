define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectMemberListItemView"],
	(_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) ->
		ProjectMembersView = ProjectSubView.extend
		
			parent: "#project-members"
			team:[]
			members:[]
			$teamList: null
			$memberList: null


			render: ->  
				@$el = $(@parent)
				console.log 'ProjectMembersView render'
				
				@$el.template @templateDir + "/templates/partials-project/project-members.html", 
					{}, =>
						@$el.find(".preload").remove()
						@$teamList = @$el.find("#team-members ul")
						@$memberList = @$el.find("#project-members ul")

			# override in subview
			addAll: -> 
				console.log 'ProjectMembersView ',@
				if @collection.models.length is 0 then @noResults() else @$el.find(".preload").remove()

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
