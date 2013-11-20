define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"model/ProjectDiscussionModel", 
		"views/partials-project/ProjectSubView", 
		"views/partials-project/ProjectWysiwygFormView", 
		"views/partials-project/ProjectDiscussionThreadItemView"], 
	(_, Backbone, $, temp, ProjectDiscussionModel, ProjectSubView, ProjectWysiwygFormView, ProjectDiscussionThreadItemView) ->
		ProjectDiscussionView = ProjectSubView.extend

			parent: "#project-discussion"
			$ul:null
			$form:null 
			$threadFormID:'#add-thread-form'
			projectWysiwygFormView:null
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

				@addDiscussion @model
				for response in @model.attributes.responses
					model = new ProjectDiscussionModel({id:response.id})
					@addDiscussion model 

				userAvatar = $('.profile-nav-header img').attr('src')
				@projectWysiwygFormView  = new ProjectWysiwygFormView({parent: @$threadFormID, id:@model.attributes.id, slim:true, userAvatar:userAvatar})


			addDiscussion:(model_)->   
				config = {parent:@$ul, model:model_}
				projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView(config)
				@$ul.append projectDiscussionThreadItemView.$el
