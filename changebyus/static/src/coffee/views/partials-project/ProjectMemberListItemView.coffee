define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
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

			events: 
				"click .delete-x": "deleteItem",

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
							url: "/api/project/change_user_role"
							data: { project_id:@projectID, user_id:@model.id, user_role:value_}
						).done (response_)=>
							if (response_.msg.toLowerCase() == "ok")
								@model.set('roles', [value_])

			deleteItem:->
				$.ajax(
					type: "POST"
					url: "/api/project/remove_member"
					data: { project_id:@projectID, user_id:@model.id}
				).done (response_)=>
					if (response_.msg.toLowerCase() == "ok")
						c = @model.collection
						console.log '@model.collection',c
						@model.collection.remove @model
						console.log '@model.collection',c