define ["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView", "views/partials-project/ProjectMemberListItemView"],
	(_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) ->
		ProjectMembersView = ProjectSubView.extend
		
			parent: "#project-members"
			$teamList: null
			$memberList: null

			render: ->  
				@$el = $(@parent)
				
				# data:this.viewData
				@$el.template @templateDir + "/templates/partials-project/project-members.html", 
					{}, =>
						@$el.find(".preload").remove()
						@$teamList = @$el.find("#team-members ul")
						@$memberList = @$el.find("#project-members ul")

			addOne: (model_) -> 
				#to do 
				view = new ProjectMemberListItemView({model:model_})
				@$teamList.append view.el
