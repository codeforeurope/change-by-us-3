define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
	(_, Backbone, $, temp, AbstractView) ->
		ProjectDiscussionCommentView = AbstractView.extend
			parent: "#project"
			
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: ->
				@$el = $("<div class='project'/>")
				@$el.template @templateDir+"/templates/partials-project/project-discussion-comment.html",
					{data: @viewData}, => @onTemplateLoad()
				$(@parent).append @$el

