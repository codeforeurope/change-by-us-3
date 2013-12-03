define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"moment", 
		"abstract-view", 
		"model/UserModel",
		"model/ProjectUpdateModel"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 moment, 
	 AbstractView, 
	 UserModel,
	 ProjectUpdateModel ) ->
		ProjectDiscussionThreadItemView = AbstractView.extend
			
			model:ProjectUpdateModel
			$repliesHolder: null
			$postRight: null
			$replyForm: null
			tagName: "li" 

			initialize: (options_) ->
				AbstractView::initialize.call(@, options_)
				console.log 'loadModel',@model
				@model.fetch
					success: =>@loadUser()

			loadUser:->
				@user = new UserModel(id:@model.get("user").id)
				@user.fetch
					success: =>@render()

			render: ->
				m = moment(@model.get('created_at')).format("MMMM D hh:mm a")
				@model.set('created_at',m)

				@viewData                       = @model.attributes
				@viewData.image_url_round_small = @user.get("image_url_round_small")
				@viewData.display_name          = @user.get("display_name")
				
				$(@el).template @templateDir+"/templates/partials-project/project-thread-list-item.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:-> 
				self = @ 
				@$repliesHolder = $('<ul class="content-wrapper bordered-item np hide"/>')
				@$postRight     = @$el.find('.update-content')
				$replyToggle    = @$el.find('.reply-toggle').first()
				$replyToggle.click ->
					top = $("#add-thread-form").offset().top
					$("html, body").animate({ scrollTop: top }, "slow")

				onPageElementsLoad()