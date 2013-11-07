define ["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectPostReplyModel"], 
	(_, Backbone, $, temp, moment, AbstractView, ProjectPostReplyModel) ->
		ProjectPostReplyView = AbstractView.extend

			model:null
			tagName: "li"

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@model = new ProjectPostReplyModel({id:options.id})
				@render()

			render: ->
				$reply = $("<div class='post-reply clearfix'/>")
				$reply.template(@templateDir+"/templates/partials-project/project-post-reply-view.html", 
					{data:{}}, =>
				)
				$(@el).append $reply


