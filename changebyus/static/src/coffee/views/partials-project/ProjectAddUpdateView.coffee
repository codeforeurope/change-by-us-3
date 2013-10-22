define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectWysiwygFormView"],
	(_, Backbone, $, temp, AbstractView, ProjectWysiwygFormView) ->
		ProjectAddUpdateView = AbstractView.extend

			parent: "#project-update"
		
			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: -> 
				@$el = $(@parent)
				@$el.template @templateDir + "/templates/partials-project/project-add-update.html",
					{data: @viewData}, => 
						form = new ProjectWysiwygFormView({parent:"#update-form"})
						$submit = form.$el.find('input[type="submit"]')
						console.log '$submit',$submit,form.$el
						form.beforeSubmit = (arr_, form_, options_)->
							$submit.attr("disabled", "disabled");
							share = []
							if $("#twitter").val() is "on" then share.push 'twitter'
							if $("#facebook").val() is "on" then share.push 'facebook'
							arr_.push {name: "social_sharing", value:share, type: "hidden", required: false}
							# console.log('form.beforeSubmit', arr_, form_, options_)

						form.success = (response_)->
							console.log 'response_',response_

						$shareOptions = $(".share-options")
						$shareToggle = $(".share-toggle")
						$shareToggle.click -> $shareOptions.toggleClass("hide")
