define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"moment", 
		"abstract-view", 
		"model/ProjectUpdateModel", 
		"model/UserModel"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 moment, 
	 AbstractView, 
	 ProjectUpdateModel, 
	 UserModel) ->
		UserStreamItemView = AbstractView.extend
			
			model:ProjectUpdateModel

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@viewData = @model.attributes
				@user = new UserModel(id:@model.get("user.id"))
				@user.fetch
					success: =>@render()

			render: ->
				@viewData.image_url_round_small = @user.get("image_url_round_small")
				@viewData.display_name          = @user.get("display_name")
				
				m = moment(@model.get("created_at")).format("MMMM D hh:mm a")
				@model.set("format_date", m)

				$(@el).template @templateDir+"/templates/partials-user/stream-item-view.html",
					{data:@viewData}, => @onTemplateLoad()
				@