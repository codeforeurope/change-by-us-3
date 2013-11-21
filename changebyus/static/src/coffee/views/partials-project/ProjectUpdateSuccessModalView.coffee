define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectWysiwygFormView"],
	(_, Backbone, $, temp, AbstractView, ProjectWysiwygFormView) ->
		ProjectUpdateSuccessModalView = AbstractView.extend

			parent: "body"
		
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: -> 
				@$el = $("<div class='modal-fullscreen dark'/>") 
				@$el.template @templateDir+"/templates/partials-project/project-share-success-overlay.html",
					{data: @model}, => @onTemplateLoad()
				$(@parent).append @$el 

			onTemplateLoad:->
				@$el.find(".close-x").click => @$el.remove()