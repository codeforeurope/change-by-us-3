define ["underscore", "backbone", "jquery", "template", "form", "abstract-modal-view"], 
	(_, Backbone, $, temp, form, AbstractModalView) ->
		ProjectEmbedCalendarModalView = AbstractModalView.extend
		
			initialize: (options) ->
				AbstractModalView::initialize.call @, options
				@viewData.id   = @model.id
				@viewData.slug = @model.slug

			render: ->
				@$el = $("<div class='modal-fullscreen dark'/>") 
				@$el.template @templateDir+"/templates/partials-project/project-embed-calendar.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el 

			onTemplateLoad: ->
				AbstractModalView::onTemplateLoad.call @, options

				$form = @$el.find('form') 

				options =
					type: $form.attr('method')
					url: $form.attr('action')
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
					success: (response) ->
						console.log response
						#if response.msg.toLowerCase() is "ok" then window.location.reload()
						if response.success then window.location.reload()

				$form.submit -> 
					obj = $form.serializeJSON()
					json_str = JSON.stringify(obj)
					options.data = json_str
					$.ajax options
					false
