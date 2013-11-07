define ["underscore", "backbone", "jquery", "template", "abstract-view", "collection/ProjectListCollection"], 
	(_, Backbone, $, temp, AbstractView, ProjectListCollection) ->

		CBUProfileView = AbstractView.extend

			render: -> 
				console.log '@',@model
				@$el.template(@templateDir+"/templates/profile.html", 
					{}, => @onTemplateLoad())

			onTemplateLoad:->
				console.log 'onTemplateLoad'
				