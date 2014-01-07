define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		ResourceProjectPreviewView = AbstractView.extend

			isProject:false
			isResource:false
			isOwned:false
			isFollowed:false

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@isProject  = options.isProject || @isProject 
				@isOwned    = options.isOwned || @isOwned
				@isFollowed = options.isFollowed || @isFollowed
				# @render()

			events: 
				"click .close-x": "close"

			render: ->
				viewData            = @model.attributes
				viewData.isProject  = @isProject 
				viewData.isOwned    = @isOwned
				viewData.isFollowed = @isFollowed

				@$el = $("<li class='project-preview'/>")
				@$el.template @templateDir+"/templates/partials-universal/project-resource.html", 
					{data: viewData}, => @onTemplateLoad()

			onFetch:(r)-> 
				console.log 'onFetch', @parent
				$(@parent).append @render()

			# onTemplateLoad
			close:->
				$closeX = @$el.find('.close-x')
				$closeX.hide()
				dataObj = {project_id:@model.id}
				$.ajax(
					type: "POST"
					url: "/api/project/leave"
					data: JSON.stringify(dataObj) 
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
				).done (response)=>
					if response.success
						@model.collection.remove @model
						@$el.remove() 
					else
						$closeX.show()