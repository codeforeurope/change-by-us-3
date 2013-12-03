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
			isStream:false
			$repliesHolder: null
			$postRight: null
			$replyForm: null 

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@viewData = @model.attributes
				@isStream = options.isStream || @isStream

				@el  = if @isStream then $('<div/>').addClass('content-wrapper') else $('<li/>')
				@$el = $(@el) 

				@user = new UserModel(id:@model.get("user").id)
				@user.fetch
					success: =>@render()

			render: ->
				@viewData.image_url_round_small = @user.get("image_url_round_small")
				@viewData.display_name          = @user.get("display_name")
				
				m = moment(@model.get("created_at")).format("MMMM D hh:mm a")
				@model.set("format_date", m)

				@$el.template @templateDir+"/templates/partials-project/project-update-list-item.html",
					{data:@viewData}, => @onTemplateLoad()
				@

			onTemplateLoad:-> 
				if @isStream
					projectName   = @model.get("project").name
					$projectTitle = $("<div/>").addClass("project-name-corner")
					$projectTitle.html(projectName)
					@$el.append $projectTitle

				@addReplies()

			addReplies:-> 
				console.log 'addReplies',@model
				self = @ 
				@$repliesHolder = $('<ul class="content-wrapper bordered-item np hide"/>')
				@$postRight     = @$el.find('.update-content')
				$replyToggle    = @$el.find('.reply-toggle').first()
				$replyToggle.click ->
					$(this).find('.reply').toggleClass('hide')
					self.$repliesHolder.toggleClass('hide')

				@addReply(reply) for reply in @model.get('responses') 

				viewData = @model.attributes
				viewData.image_url_round_small = $('.profile-nav-header img').attr('src')

				@$replyForm = $('<li class="post-reply-form"/>')
				@$replyForm.template @templateDir+"/templates/partials-project/project-post-reply-form.html",
					{data:viewData}, => @onFormLoaded()

			addReply:(reply_)->
				projectPostReplyView = new ProjectPostReplyView({model:reply_})
				if $('.post-reply-form').length > 0
					projectPostReplyView.$el.insertBefore('.post-reply-form')
				else
					@$repliesHolder.append projectPostReplyView.$el

			onFormLoaded:->
				@$postRight.append @$repliesHolder
				@$repliesHolder.append @$replyForm
				
				options =
					success: (response_) =>
						console.log response_
						@$replyForm.find('form').resetForm()
						@addReply response_.data

				@$replyForm.find('form').ajaxForm options