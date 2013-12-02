define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"moment", 
		"abstract-view", 
		"model/ProjectUpdateModel", 
		"model/UserModel",
		"views/partials-project/ProjectPostReplyView"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 moment, 
	 AbstractView, 
	 ProjectUpdateModel, 
	 UserModel,
	 ProjectPostReplyView) ->
		ProjectUpdateListItemView = AbstractView.extend
			
			model:ProjectUpdateModel
			$repliesHolder: null
			$postRight: null
			$replyForm: null
			tagName: "li"

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@viewData = @model.attributes
				@user = new UserModel(id:@model.attributes.user.id)
				@user.fetch
					success: =>@render()

			render: ->
				@viewData.image_url_round_small = @user.attributes.image_url_round_small
				@viewData.display_name          = @user.attributes.display_name
				
				m = moment(@model.attributes.created_at).format("MMMM D hh:mm a")
				@model.attributes.format_date = m

				$(@el).template @templateDir+"/templates/partials-project/project-update-list-item.html",
					{data:@viewData}, => @addReplies()
				@

			addReplies:-> 
				self = @ 
				@$repliesHolder = $('<ul class="content-wrapper bordered-item np hide"/>')
				@$postRight     = @$el.find('.update-content')
				$replyToggle    = @$el.find('.reply-toggle').first()
				$replyToggle.click ->
					$(this).find('.reply').toggleClass('hide')
					self.$repliesHolder.toggleClass('hide')

				for reply in @model.get('responses') 
					projectPostReplyView = new ProjectPostReplyView(reply)
					@$repliesHolder.append projectPostReplyView.$el 

				@$replyForm = $('<li class="post-reply-form"/>')
				@$replyForm.template @templateDir+"/templates/partials-project/project-post-reply-form.html",
					{data:@model.attributes}, => @onFormLoaded()

			onFormLoaded:->
				@$postRight.append @$repliesHolder
				@$repliesHolder.append @$replyForm
				
				options =
					success: (response) ->
						console.log response

				@$replyForm.find('form').ajaxForm options