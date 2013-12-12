define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectWysiwygFormView"],
	(_, Backbone, $, temp, AbstractView, ProjectWysiwygFormView) ->
		ProjectNewDiscussionView = AbstractView.extend

			parent: "#project-new-discussion"
		
			initialize: (options) -> 
				AbstractView::initialize.call @, options
				@render()

			events: 
				"click input[value=Cancel]": "cancel"

			render: -> 
				@$el = $(@parent)
				@$el.template @templateDir+"/templates/partials-project/project-new-discussion.html",
					{data: @viewData}, => @onTemplateLoad()

			onTemplateLoad:->
				form = new ProjectWysiwygFormView({parent:"#discussion-form"})
				form.success = (response_) =>
					form.resetForm()
					window.location = "/project/"+@model.id+"/admin#discussion/"+response_.data.id

			cancel:->
				@$el.find('input[value=Cancel]').click =>
					$("#discussion-editor").html('')
					@$el.find('form').resetForm()
					window.location.hash = '#discussions'
