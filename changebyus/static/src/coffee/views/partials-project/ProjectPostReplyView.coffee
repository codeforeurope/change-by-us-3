define ["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectPostReplyModel"], 
	(_, Backbone, $, temp, moment, AbstractView, ProjectPostReplyModel) ->
		ProjectPostReplyView = AbstractView.extend

			tagName: "li"

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()
			
			render: ->
				console.log '@viewData',@viewData
				$reply = $("<div class='post-reply clearfix'/>")
				$reply.template @templateDir+"/templates/partials-project/project-post-reply-view.html", 
					{data:@viewData}, => @onTemplateLoad()
				$(@el).append $reply