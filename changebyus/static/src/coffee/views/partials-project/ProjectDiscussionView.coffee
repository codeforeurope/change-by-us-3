define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"model/ProjectDiscussionModel", 
		"views/partials-project/ProjectSubView", 
		"views/partials-universal/WysiwygFormView", 
		"views/partials-project/ProjectDiscussionThreadItemView"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 ProjectDiscussionModel, 
	 ProjectSubView, 
	 WysiwygFormView, 
	 ProjectDiscussionThreadItemView) ->
		ProjectDiscussionView = ProjectSubView.extend

			$ul:null
			$form:null
			discussionsCollection:null
			$threadFormID:"#add-thread-form"
			parent: "#project-discussion"
			wysiwygFormView:null
			delayedDataLoad:false

			initialize: (options_) -> 
				@discussionsCollection = options_.discussionsCollection || @discussionsCollection
				@discussionsCollection.on 'add', @updateCount, @
				@discussionsCollection.on 'reset', @updateCount, @
				
				console.log '@discussionsCollection',@discussionsCollection

				ProjectSubView::initialize.call(@, options_)

			render: ->
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/partials-project/project-discussion.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:->
				@templateLoaded = true
				@$ul = @$el.find('.bordered-item')
				@$form = @$el.find(@$threadFormID)
				if @delayedDataLoad then @onSuccess()

				ProjectSubView::onTemplateLoad.call @

			updateDiscussion:(id_)-> 
				@model = new ProjectDiscussionModel({id:id_})
				@model.fetch
					success:=>
						if @templateLoaded is false 
							@delayedDataLoad = true
						else
							@onSuccess()

			updateCount:->
				console.log 'ProjectDiscussionView updateCount', @discussionsCollection
				title = if @model? then @model.get("title") else ""
				@$el.find(".admin-title").html "All Discussions (#{@discussionsCollection.length}): #{title}"
			
			onSuccess:->  
				@$ul.html('')
				@$form.html('')

				@addDiscussion @model
				for response in @model.get("responses")
					model = new ProjectDiscussionModel({id:response.id})
					@addDiscussion model 

				userAvatar = $('.profile-nav-header img').attr('src')
				@wysiwygFormView = new WysiwygFormView({parent:@$threadFormID, id:@model.get("id"), slim:true, userAvatar:userAvatar, title:@model.get("title")})
				@wysiwygFormView.success = (e)=>
					if e.success
						$("#new-thread-editor").html("")
						model = new ProjectDiscussionModel(e.data)
						@addDiscussion model

						#@discussionsCollection.add model

			addDiscussion:(model_)->
				projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView({model:model_})
				@$ul.append projectDiscussionThreadItemView.$el
