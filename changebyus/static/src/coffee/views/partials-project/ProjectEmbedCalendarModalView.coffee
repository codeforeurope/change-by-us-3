define ["underscore", "backbone", "jquery", "template", "form", "abstract-modal-view"], 
	(_, Backbone, $, temp, form, AbstractModalView) ->
		ProjectEmbedCalendarModalView = AbstractModalView.extend
		
			initialize: (options) ->
				AbstractModalView::initialize.call @, options
				@viewData.id   = @model.id
				@viewData.slug = @model.slug
				@render()

			render: ->
				@$el = $("<div class='modal-fullscreen'/>")
				@$el.template @templateDir+"/templates/partials-project/project-embed-calendar.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el 

			onTemplateLoad: ->
				AbstractModalView::onTemplateLoad.call @, options

				options =
					success: (response) ->
						console.log response
						if response.msg.toLowerCase() is "ok" then window.location.reload()
				@$el.find('form').ajaxForm options
