define ["underscore", 
		"backbone", 
		"jquery", 
		"template", 
		"moment", 
		"abstract-view", 
		"model/UpdateModel", 
		"model/UserModel",
		"views/partials-universal/PostReplyView"], 
	(_, 
	 Backbone, 
	 $, 
	 temp, 
	 moment, 
	 AbstractView, 
	 UpdateModel, 
	 UserModel,
	 PostReplyView) ->
		UpdateListItemView = AbstractView.extend
			
			model:UpdateModel
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

			events:
				"click .reply-toggle:first":"onReplyToggleClick"

			render: ->
				@viewData.image_url_round_small = @user.get("image_url_round_small")
				@viewData.display_name          = @user.get("display_name")
				
				m = moment(@model.get("created_at")).format("MMMM D hh:mm a")
				@model.set("format_date", m)

				@$el.template @templateDir+"/templates/partials-universal/update-list-item.html",
					{data:@viewData}, => @onTemplateLoad()
				@

			onTemplateLoad:-> 
				if @isStream
					projectName   = @model.get("project").name
					$projectTitle = $("<div/>").addClass("project-name-corner")
					$projectTitle.html(projectName)
					@$el.append $projectTitle

				@addReplies()
				@delegateEvents()

			addReplies:-> 
				console.log 'addReplies',@model
				self = @ 
				@$repliesHolder = $('<ul class="content-wrapper bordered-item np hide"/>')

				@addReply(reply) for reply in @model.get('responses') 

				viewData = @model.attributes
				viewData.image_url_round_small = $('.profile-nav-header img').attr('src')

				@$replyForm = $('<li class="post-reply-form"/>')
				@$replyForm.template @templateDir+"/templates/partials-universal/post-reply-form.html",
					{data:viewData}, => @onFormLoaded()

			addReply:(reply_)->
				console.log 'reply_',reply_
				postReplyView = new PostReplyView({model:reply_})
				replyForm = @$el.find('.post-reply-form')
				if replyForm.length > 0
					postReplyView.$el.insertBefore replyForm
				else
					@$repliesHolder.append postReplyView.$el

			onReplyToggleClick:(e)->
				$(e.currentTarget).find('.reply').toggleClass('hide')
				self.$repliesHolder.toggleClass('hide')

			onFormLoaded:->
				@$el.find('.update-content').append @$repliesHolder
				@$repliesHolder.append @$replyForm
				
				$form = @$replyForm.find('form')
				
				options =
					type: $form.attr('method')
					url: $form.attr('action')
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
					success: (response_) => 
						$form.find('form').resetForm()
						@addReply response_.data

				$form.submit -> 
					obj = $form.serializeJSON()
					json_str = JSON.stringify(obj)
					options.data = json_str
					$.ajax options
					false