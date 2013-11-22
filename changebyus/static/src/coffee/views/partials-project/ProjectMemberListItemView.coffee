define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
	ProjectMemberListItemView = AbstractView.extend
		
		tagName: "li"
		view:"public"

		initialize: (options) ->
			AbstractView::initialize.call @, options 

			@view          = options.view || @view
			@viewData      = @model.attributes
			@viewData.view = @view

			@render()

		render: ->
			@$el = $(@el)
			@$el.template @templateDir+"/templates/partials-project/project-member-list-item.html",
				{data:@viewData}, => @onTemplateLoad()
			@

		onTemplateLoad:->
			if (@view is "admin")
				$dk = $("#"+@model.id).dropkick() 