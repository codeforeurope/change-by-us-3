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

			render: ->
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-discussion.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:->
				@$ul = @$el.find('.bordered-item')
				@$form = @$el.find(@$threadFormID)
				onPageElementsLoad()

			updateDiscussion:(discussion_)->
				@$ul.html('')
				@$form.html('')

				@addOne discussion_
				for response in discussion_.attributes.responses
					model = new ProjectDiscussionModel({id:response.id})
					@addOne model, true

				@projectWysiwygFormView  = new ProjectWysiwygFormView({parent: @$threadFormID, id:discussion_.attributes.id})


			addOne:(model_, forceLoad_=false)->   
				config = {parent:@$ul, model:model_}
				projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView(config, forceLoad_)
				@$ul.append projectDiscussionThreadItemView.$el
