define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->

		CBUProfileView = AbstractView.extend

			initialize: (options) -> 
				###
				@model.fetch 
					success: =>@render()
				###

			render: -> 

				@$el.template(@templateDir+"/templates/profile.html", {}
					, => @onTemplateLoad())

			onTemplateLoad:->
				# finalize stuff