define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		CBUStreamView = AbstractView.extend

			initialize: (options) ->
				@templateDir = options.templateDir or @templateDir
				@parent = options.parent or @parent
				@viewData = options.viewData or @viewData
				@render()

			render: ->
				@$el = $(@el)
				@$el.template @templateDir + "/templates/stream.html",
					data: @viewData, =>

				$(@parent).append @$el
