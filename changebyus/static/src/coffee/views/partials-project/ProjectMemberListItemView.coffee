define ["underscore", "backbone", "jquery", "template", "abstract-view"], (_, Backbone, $, temp, AbstractView) ->
	ProjectMemberListItemView = AbstractView.extend
		
		tagName: "li"
		view:"public"
		projectID:0

		initialize: (options_) ->
			console.log 'initialize initialize initialize initialize'
			AbstractView::initialize.call @, options_ 

			@view          = options_.view || @view
			@projectID     = options_.projectID || @projectID
			@viewData      = @model.attributes
			@viewData.view = @view
			@viewData.sid  = Math.random().toString(20).substr(2)

			@render()

		render: ->
			@$el = $(@el)
			@$el.template @templateDir+"/templates/partials-project/project-member-list-item.html",
				{data:@viewData}, => @onTemplateLoad()
			@

		onTemplateLoad:->
			console.log 'onTemplateLoad onTemplateLoad onTemplateLoad'
			delay 1, =>
				if (@view is "admin")
					$dk = $("#"+@viewData.sid).dropkick
						change: (value_, label_) =>
							$.ajax(
								type: "POST"
								url: "/api/project/change_user_role"
								data: { project_id:@projectID, user_id:@model.id, user_role:value_}
							).done (response_)=>
								if (response_.msg.toLowerCase() == "ok")
									$dk = null
									@model.set('roles', [value_])
					console.log $dk