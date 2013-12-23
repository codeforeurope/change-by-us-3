define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		ProjectMemberListItemView = AbstractView.extend
			
			tagName: "li"
			view:"public"
			projectID:0

			initialize: (options_) -> 
				AbstractView::initialize.call @, options_ 

				@view          = options_.view || @view
				@projectID     = options_.projectID || @projectID
				@viewData      = @model.attributes
				@viewData.view = @view
				@viewData.sid  = Math.random().toString(20).substr(2)

				@render()

			events: 
				"click .delete-x": "deleteItem"

			render: ->
				@$el = $(@el)
				@$el.template @templateDir+"/templates/partials-project/project-member-list-item.html",
					{data:@viewData}, => @onTemplateLoad()
				@

			onTemplateLoad:-> 
				if (@view is "admin")
					delay 1, => @addDropKick()

			addDropKick:->
				$("#"+@viewData.sid).dropkick
					change: (value_, label_) =>
						$.ajax(
							type: "POST"
							url: "/api/project/change-user-role"
							data: { project_id:@projectID, user_id:@model.id, user_role:value_}
						).done (response_)=>
							if (response_.msg.toLowerCase() == "ok")
								@model.set('roles', [value_])

			deleteItem:->
				dataObj = { project_id:@projectID, user_id:@model.id}
				$.ajax(
					type: "POST"
					url: "/api/project/remove-member"
					data: JSON.stringify(dataObj) 
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
				).done (response_)=>
					if (response_.msg.toLowerCase() == "ok")
						c = @model.collection