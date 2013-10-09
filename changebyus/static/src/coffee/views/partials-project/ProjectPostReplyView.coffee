define ["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectPostReplyModel"], 
	(_, Backbone, $, temp, moment, AbstractView, ProjectPostReplyModel) ->
		ProjectPostReplyView = AbstractView.extend

			model:null
			tagName: "li"

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@model = new ProjectPostReplyModel({id:options.id})
				#@model.fetch success:=>@render()
				@render()

			render: ->
				#m = moment(@model.attributes.created_at).format("MMMM D HH:mm a")
				#@model.attributes.format_date = m

				$reply = $("<div class='post-reply clearfix'/>")
				$reply.template(@templateDir+"/templates/partials-project/project-post-reply-view.html", 
					{data:{}}, =>
				)
				$(@el).append $reply


