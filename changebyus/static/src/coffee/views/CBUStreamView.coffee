define ["underscore", "backbone", "jquery", "template"], 
	(_, Backbone, $, temp) ->
		CBUStreamView = Backbone.View.extend
			parent: "body"
			templateDir: "/static"
			viewData: {}
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
