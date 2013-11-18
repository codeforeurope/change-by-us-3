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
					{data: @viewData}, => @onTemplateLoad()
			else
				@$el.template @templateDir + "/templates/partials-project/project-fundraising-get-started.html", 
					{}, => @getStarted()
						

		getStarted:->
			$how = $('.fundraising-left .content-wrapper')
			$how.slideToggle(1)

			$('#does-it-work').click (e)=>
				$how.slideToggle()

			$('.btn-large').click (e)=>
				e.preventDefault() 
				console.log 'ProjectFundraisingView '
				
				# post to API, get URL and pass to popupWindow function
				$.ajax(
					type: "POST"
					url: "/stripe/link"
					data: { project_id:@id, project_name:@name }
				).done (response_)=>
					popWindow response_
