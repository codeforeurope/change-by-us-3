define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"moment", 
		"abstract-view", 
		"model/ProjectUpdateModel", 
		"views/partials-project/ProjectPostReplyView"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 moment, 
	 AbstractView, 
	 ProjectUpdateModel, 
	 ProjectPostReplyView) ->
		ProjectDiscussionThreadItemView = AbstractView.extend
			
			model:ProjectUpdateModel
			$repliesHolder: null
			$postRight: null
			$replyForm: null
			tagName: "li"

			initialize: (options_, forceLoad_) ->
				AbstractView::initialize.call(@, options_)
				if forceLoad_ then @loadModel() else @render()

			loadModel:->
				console.log 'loadModel',@model
	 
			render: ->
				m = moment(@model.attributes.created_at).format("MMMM D hh:mm a")
				@model.attributes.format_date = m

				$(@el).template(@templateDir+"/templates/partials-project/project-thread-list-item.html",
					{data: @model.attributes}, => @onTemplateLoad()
				)
				@ 

			onTemplateLoad:-> 
				self = @ 
				@$repliesHolder = $('<ul class="content-wrapper bordered-item np hide"/>')
				@$postRight     = @$el.find('.update-content')
				$replyToggle    = @$el.find('.reply-toggle').first()
				$replyToggle.click ->
					# scroll to replybox