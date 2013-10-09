define ["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectUpdateModel", "views/partials-project/ProjectPostReplyView"], 
	(_, Backbone, $, temp, moment, AbstractView, ProjectUpdateModel, ProjectPostReplyView) ->
		ProjectUpdateListItemView = AbstractView.extend
			
			model:ProjectUpdateModel
			$repliesHolder: null
			$postRight: null
			$replyForm: null

			render: ->
				m = moment(@model.attributes.created_at).format("MMMM D hh:mm a")
				@model.attributes.format_date = m

				$(@el).template(@templateDir+"/templates/partials-project/project-update-list-item.html",
					{data: @model.attributes}, => @addReplies()
				)
				@

			addReplies:-> 
				self = @
				@$repliesHolder = $('<ul class="post-replies hide"/>')
				@$postRight     = @$el.find('.post-right')
				$replyToggle    = @$el.find('.reply-toggle')
				$replyToggle.click ->
					$(this).find('.reply').toggleClass('hide')
					self.$repliesHolder.toggleClass('hide')

				for reply in @model.get('responses') 
					projectPostReplyView = new ProjectPostReplyView(reply)
					@$repliesHolder.append projectPostReplyView.$el 

				@$replyForm = $('<li class="post-reply-form"/>')
				@$replyForm.template(@templateDir+"/templates/partials-project/project-post-reply-form.html",
					{data:@model.attributes}, => @onFormLoaded()
				)

			onFormLoaded:->
				@$postRight.append @$repliesHolder
				@$repliesHolder.append @$replyForm
				
				options =
					success: (response) ->
						console.log response

				@$replyForm.find('form').ajaxForm options