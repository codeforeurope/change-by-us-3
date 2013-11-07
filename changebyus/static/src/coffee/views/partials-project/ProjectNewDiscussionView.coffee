define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectWysiwygFormView"],
	(_, Backbone, $, temp, AbstractView, ProjectWysiwygFormView) ->
		ProjectNewDiscussionView = AbstractView.extend

			parent: "#project-new-discussion"
		
			initialize: (options) -> 
				AbstractView::initialize.call @, options
				@render()

			render: -> 
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-new-discussion.html",
					{data: @viewData}, => 
						form = new ProjectWysiwygFormView({parent:"#discussion-form"})
						form.success = (response_) =>
							form.resetForm()
							window.location = "/project/"+@model.id+"#discussion/"+response_.data.id
