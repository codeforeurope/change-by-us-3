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
			currentData:""

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
						{}, => @loadDayTemplate()

			loadDayTemplate:->
				@$day = $('<div />')
				@$day.template @templateDir+"/templates/partials-project/project-entries-day-wrapper.html",
					{}, =>
						if @collection.length > 0
							model_ = @collection.models[0]
							m = moment(model_.attributes.updated_at).format("MMMM D")
							@newDay(m)

						@isDataLoaded = true

						ProjectSubView::addAll.call(@) 

			newDay:(date_)->
				@currentData = date_
				@$currentDay = @$day.clone()
				@$el.append @$currentDay
				@$currentDay.find('h4').html(date_)
				@$ul = @$currentDay.find('.bordered-item') 

			addOne:(model_)->
				m = moment(model_.attributes.updated_at).format("MMMM D")
				if @currentData isnt m then @newDay(m)

				config = {model:model_}
				projectDiscussionListItemView = new ProjectDiscussionListItemView(config) 
				projectDiscussionListItemView.on 'click', =>
					@trigger 'discussionClick', config
				projectDiscussionListItemView.on 'delete', => 
					@deleteDiscussion config.model.attributes.id
				@$ul.append projectDiscussionListItemView.$el

				onPageElementsLoad()


			deleteDiscussion:(id_)->
				$.ajax(
					type: "POST"
					url: "/api/post/delete"
					data: { post_id:id_ }
				).done (response)=> 
					console.log 'deleteDiscussion',response