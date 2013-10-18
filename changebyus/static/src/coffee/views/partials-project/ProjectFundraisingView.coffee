define ["underscore", "backbone", "jquery", "template",  "form", "abstract-view"], (_, Backbone, $, temp, form, AbstractView) ->
	ProjectFundraisingView = AbstractView.extend
		
		parent: "#project-calendar"
		name:"My Project"
		
		initialize: (options) ->
			AbstractView::initialize.call @, options
			@name = options.name || @name;
			@render()

		render: ->  
			@$el = $(@parent)
			if @started
				@$el.template @templateDir + "/templates/partials-project/project-fundraising-goals.html",
					{data: @viewData}, =>
			else
				@$el.template @templateDir + "/templates/partials-project/project-fundraising-get-started.html", 
					{}, => @getStarted()
						

		getStarted:->
			$('.btn-large').click (e)=>
				e.preventDefault()
				console.log 'ProjectFundraisingView here',@
				$.ajax(
					type: "POST"
					url: "/stripe/link"
					data: { project_id:@id, project_name:@name }
				).done (response)=>
					console.log 'more',response

				###
					options =
					success: (response) ->
						console.log response

				@$el.find('form').ajaxForm options
				###

