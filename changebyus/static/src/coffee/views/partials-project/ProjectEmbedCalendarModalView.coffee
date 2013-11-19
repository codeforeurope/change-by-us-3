define ["underscore", "backbone", "jquery", "template", "form", "abstract-view", ], 
	(_, Backbone, $, temp, form, AbstractView) ->
		ProjectEmbedCalendarModalView = AbstractView.extend
		
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@viewData.id   = @model.id
				@viewData.slug = @model.slug
				@render()

			render: ->
				@$el = $("<div class='modal-fullscreen'/>")
				@$el.template @templateDir + "/templates/partials-project/project-embed-calendar.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el 

			onTemplateLoad: ->
				options =
					success: (response) ->
						console.log response
						if response.msg.toLowerCase() is "ok" then window.location.reload()
				@$el.find('form').ajaxForm options

