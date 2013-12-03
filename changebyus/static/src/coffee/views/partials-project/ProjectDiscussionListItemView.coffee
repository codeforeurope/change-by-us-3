define ["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel"], 
	(_, Backbone, $, temp, AbstractView, UserModel) ->
		ProjectDiscussionListItemView = AbstractView.extend
			
			tagName: "li"
			user:null

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@viewData = @model.attributes
				@user = new UserModel(id:@model.get("user").id)
				@user.fetch
					success: =>@render()

			render: -> 
				m =  moment(@model.get("created_at")).format("MMMM D hh:mm a")
				@model.set("format_date", m)
				@viewData.image_url_round_small = @user.get("image_url_round_small")
				@viewData.display_name          = @user.get("display_name")
				
				@$el = $(@el)
				@$el.template @templateDir + "/templates/partials-project/project-discussion-list-item.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:->
				@$el.find('.user-avatar, .description').click =>
					@trigger "click", @model
				@$el.find('.delete').click =>
					@trigger "delete", @model  