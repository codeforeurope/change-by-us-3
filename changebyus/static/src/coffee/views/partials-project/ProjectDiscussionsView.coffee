define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"views/partials-project/ProjectSubView",
		"views/partials-project/ProjectDiscussionListItemView"],
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 ProjectSubView, 
	 ProjectDiscussionListItemView) ->

		ProjectDiscussionsView = ProjectSubView.extend

			parent: "#project-discussions"
			$ul:null

			render: ->  
				@$el = $(@parent)
				@templateLoaded = true

			addAll: ->
				console.log 'ProjectDiscussionsView addAll',@collection
				
				if @collection.models.length is 0
					@$el.template @templateDir+"/templates/partials-project/project-zero-discussions.html", 
						{}, => onPageElementsLoad()
				else
					@$el.template @templateDir+"/templates/partials-project/project-all-discussions.html",
						{}, => 
							@$ul = @$el.find('.bordered-item')
							ProjectSubView::addAll.call(@)
							onPageElementsLoad()

				@isDataLoaded = true

			addOne:(model_)->  
				config = {model:model_}
				projectDiscussionListItemView = new ProjectDiscussionListItemView(config) 
				projectDiscussionListItemView.on 'click', =>
					@trigger 'discussionClick', config
				projectDiscussionListItemView.on 'delete', => 
					@deleteDiscussion config.model.attributes.id
				@$ul.append projectDiscussionListItemView.$el


			deleteDiscussion:(id_)->
				$.ajax(
					type: "POST"
					url: "/api/post/delete"
					data: { post_id:id_ }
				).done (response)=> 
					console.log 'deleteDiscussion',response