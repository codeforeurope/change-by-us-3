define ["underscore", "backbone", "jquery", "template", "abstract-modal-view"],
	(_, Backbone, $, temp, AbstractModalView) ->
		ProjectUpdateSuccessModalView = AbstractModalView.extend

			render: ->  
				@$el = $("<div class='modal-fullscreen dark'/>") 
				@$el.template @templateDir+"/templates/partials-project/project-share-success-modal.html",
					{data: @model}, => @onTemplateLoad()
				$(@parent).append @$el 