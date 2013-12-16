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

			parent: "#project-discussion"
			$ul:null
			$form:null 
			$threadFormID:'#add-thread-form'
			WysiwygFormView:null
			delayedDataLoad:false

			render: ->
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/partials-project/project-discussion.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:->
				@templateLoaded = true
				@$ul = @$el.find('.bordered-item')
				@$form = @$el.find(@$threadFormID)
				onPageElementsLoad()
				if @delayedDataLoad then @onSuccess()

			updateDiscussion:(id_)->
				@model = new ProjectDiscussionModel(id:id_)
				@model.fetch
					success:=> 
						if @templateLoaded is false 
							@delayedDataLoad = true
						else
							@onSuccess()
			
			onSuccess:-> 
				@$ul.html('')
				@$form.html('')
				console.log 'onSuccess',@model
				@addDiscussion @model
				for response in @model.get("responses")
					model = new ProjectDiscussionModel({id:response.id})
					@addDiscussion model 

				userAvatar = $('.profile-nav-header img').attr('src')
				@WysiwygFormView = new WysiwygFormView({parent: @$threadFormID, id:@model.get("id"), slim:true, userAvatar:userAvatar})
				@WysiwygFormView.success = ->
					window.location.reload()


			addDiscussion:(model_)->   
				config = {parent:@$ul, model:model_}
				projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView(config)
				@$ul.append projectDiscussionThreadItemView.$el
