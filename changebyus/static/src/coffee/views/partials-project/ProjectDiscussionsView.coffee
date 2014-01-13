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

			onCollectionLoad:-> 
				ProjectSubView::onCollectionLoad.call(@)

				@collection.on 'remove', (obj_)=> 
					@addAll()
					@deleteDiscussion(obj_.id)
				
			addAll: ->
				if @collection.models.length is 0
					@$el.template @templateDir+"/templates/partials-project/project-zero-discussions.html", 
						{}, => onPageElementsLoad()
				else
					@$el.template @templateDir+"/templates/partials-project/project-all-discussions.html",
						{}, => @loadDayTemplate()

			loadDayTemplate:->
				@$day = $('<div />')
				@$day.template @templateDir+"/templates/partials-universal/entries-day-wrapper.html",
					{}, =>
						if @collection.length > 0
							model_ = @collection.models[0]
							m = moment(model_.get("created_at")).format("MMMM D")
							@newDay(m)

						@isDataLoaded = true

						@$el.find(".admin-title").html "All Discussions (#{@collection.models.length})"

						ProjectSubView::addAll.call(@) 

			newDay:(date_)->
				@currentDate = date_
				@$currentDay = @$day.clone()
				@$el.append @$currentDay
				@$currentDay.find('h4').html(date_)
				@$ul = @$currentDay.find('.bordered-item') 

			addOne:(model_)->
				m = moment(model_.get("created_at")).format("MMMM D")
				if @currentDate isnt m then @newDay(m)

				config = {model:model_}
				projectDiscussionListItemView = new ProjectDiscussionListItemView(config) 
				projectDiscussionListItemView.on 'click', =>
					@trigger 'discussionClick', config

				@$ul.append projectDiscussionListItemView.$el

				onPageElementsLoad()

			show:->
				ProjectSubView::show.call(@)
				@loadData()

			deleteDiscussion:(id_)->
				$feedback = $("#discussions-feedback")
				$.ajax(
					type: "POST"
					url: "/api/post/delete"
					data: { post_id:id_ }
				).done (res_)=> 
					if res_.success
						$feedback.hide()
					else
						$feedback.show().html(res_.msg)