define ["underscore", "backbone", "jquery", "template", "abstract-modal-view"], 
	(_, Backbone, $, temp, AbstractModalView) ->
		ProjectCreateModalView = AbstractModalView.extend
		
			render: ->
				@$el = $("<div class='modal-fullscreen dark'/>") 
				@$el.template @templateDir+"/templates/partials-project/project-create-modal.html",
					{data: @viewData},  =>@onTemplateLoad()
				$(@parent).append @$el 
