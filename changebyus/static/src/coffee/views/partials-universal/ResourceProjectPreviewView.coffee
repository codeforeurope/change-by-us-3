define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		ResourceProjectPreviewView = AbstractView.extend

			isProject:false
			isResource:false
			isOwned:false
			isFollowed:false
			isAdmin:false

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@isProject  = options.isProject || @isProject 
				@isOwned    = options.isOwned || @isOwned
				@isFollowed = options.isFollowed || @isFollowed
				@isAdmin    = options.isAdmin || @isAdmin
				# @render()

			events: 
				"click .close-x": "close"
				"click .btn-tertiary": "unflag"
				"click .btn-warning": "delete"

			render: ->
				viewData            = @model.attributes
				viewData.isProject  = @isProject 
				viewData.isOwned    = @isOwned
				viewData.isFollowed = @isFollowed
				viewData.isAdmin    = @isAdmin

				@$el = $("<li class='project-preview'/>")
				@$el.template @templateDir+"/templates/partials-universal/project-resource.html", 
					{data: viewData}, => 
						@$el.find('img').load =>@onTemplateLoad()

			onFetch:(r)-> 
				$(@parent).append @render()

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
				).done (response_)=>
					if response_.success
						@model.collection.remove @model
						@$el.remove() 
					else
						$closeX.show()

			delete:(e)-> 
				e.preventDefault()
				$.post "/api/project/#{@model.id}/delete", (res_)=>
					if res_.success
						@model.collection.remove @model
						@$el.remove() 

			unflag:(e)-> 
				e.preventDefault()
				$.post "/api/project/#{@model.id}/unflag", (res_)=>
					if res_.success
						@model.collection.remove @model
						@$el.remove() 