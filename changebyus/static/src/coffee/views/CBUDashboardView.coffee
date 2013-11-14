define ["underscore", 
		"backbone", 
		"bootstrap-fileupload", 
		"button"
		"jquery", 
		"template", 
		"abstract-view", 
		"collection/ProjectListCollection", 
		"model/UserModel",
		"resource-project-view"], 
	(_, Backbone, fileupload, button, $, temp, AbstractView, ProjectListCollection, UserModel, ResourceProjectPreviewView) ->

		CBUDashboardView = AbstractView.extend

			location:{name: "", lat: 0, lon: 0} 

			initialize: (options) ->  
				@templateDir = options.templateDir or @templateDir
				@parent = options.parent or @parent
				@viewData = options.viewData or @viewData 
				@userModel = new UserModel(id:@model.id)
				@userModel.fetch 
					success: =>@render() 

			render: -> 
				console.log '@userModel',@userModel
				@$el.template @templateDir+"/templates/dashboard.html", 
					{data:@userModel.attributes}, => 
						@onTemplateLoad()
						@loadProjects()
				$(@parent).append @$el

			onTemplateLoad: ->
				$('#edit-profile').template @templateDir+"/templates/partials-user/profile-edit-form.html", 
					{data:@userModel.attributes}, =>
						@onProfileEditLoad()
						@ajaxForm()

			onProfileEditLoad:->
				# @$el.prepend @$header
				@manageView   = $('#manage-projects')
				@followView   = $('#follow-projects')
				@profileView  = $('#edit-profile')
				
				@manageBTN  = $("a[href='#manage']").parent()
				@followBTN  = $("a[href='#follow']").parent()
				@profileBTN = $("a[href='#profile']").parent()

				$(window).bind "hashchange", (e) => @toggleSubView()
				@toggleSubView()

				# temp hack because somewhere this event default is prevented
				$("a[href^='#']").click (e) -> 
					window.location.hash = $(this).attr("href").substring(1)


			toggleSubView: -> 
				view = window.location.hash.substring(1)

				for v in [@manageView,@profileView,@followView]
					v.hide()

				for btn in [@followBTN,@profileBTN,@manageBTN]
					btn.removeClass "active"

				switch view 
					when "follow"
						@followView.show()
						@followBTN.addClass "active"
					when "profile"
						@profileView.show()
						@profileBTN.addClass "active"
					else 
						@manageView.show()
						@manageBTN.addClass "active"

			loadProjects:-> 
				@joinedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/joinedprojects"})
				@joinedProjects.on "reset", @addJoined, @
				@joinedProjects.fetch reset: true

				@ownedProjects = new ProjectListCollection({url:"/api/project/user/#{@model.id}/ownedprojects"})
				@ownedProjects.on "reset", @addOwned, @
				@ownedProjects.fetch reset: true
				

			addJoined:->
				@joinedProjects.each (projectModel) => @addOne(projectModel, @followView.find("ul" ), false, true)

			addOwned:->
				@ownedProjects.each (projectModel) => @addOne(projectModel, @manageView.find("ul"), true, false)

			addOne: (projectModel_, parent_, isOwned_=false, isFollowed_=false) ->
				view = new ResourceProjectPreviewView
					model: projectModel_
					isOwned: isOwned_
					isFollowed: isFollowed_
					isProject: true
					isResource: false

				@$el.find(parent_).append view.$el

			ajaxForm: ->
				$('.fileupload').fileupload({uploadtype: 'image'})

				# ajax the form
				$submit = @profileView.find("input[type=submit]")
				$form = @profileView.find("form")
				$feedback = $("#feedback")
				options =
					beforeSubmit: => 
						if $form.valid()
							$form.find("input, textarea").attr("disabled", "disabled")
							return true
						else
							return false

					success: (res) -> 
						msg = if res.msg.toLowerCase() is "ok" then "Updated Successfully" else res.msg
						$feedback.show().html(msg)

						$form.find("input, textarea").removeAttr("disabled")

						if res.success
							$("html, body").animate({ scrollTop: 0 }, "slow")
							$feedback.addClass('.alert-success').removeClass('.alert-error')
						else
							$feedback.removeClass('.alert-success').addClass('.alert-error')
				$form.ajaxForm options

				# location autocomplete
				$projectLocation = $("#location")
				$projectLocation.typeahead(
					template: '<div class="zip">{{ name }}</div>'
					engine: Hogan 
					valueKey: 'name'
					name: 'zip'
					remote:
						url: "/api/project/geopoint?s=%QUERY"
						filter: (resp) ->
							zips = []
							if resp.msg.toLowerCase() is "ok" and resp.data.length > 0
								for loc in resp.data
									zips.push {'name':loc.name,'lat':loc.lat,'lon':loc.lon}
							zips
				).bind('typeahead:selected', (obj, datum) =>
						@location = datum
						$('input[name="location"]').val @location.name
						$('input[name="lat"]').val @location.lat
						$('input[name="lon"]').val @location.lon
						console.log(datum)
				)

				$('input:radio').screwDefaultButtons
					image: 'url("/static/img/black-check.png")'
					width: 18
					height: 18