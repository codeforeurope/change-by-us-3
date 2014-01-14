define ["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view","autocomp", "model/ProjectModel", "resource-project-view"], 
	(_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, ResourceProjectPreviewView) ->
		BannerSearchView = AbstractView.extend

			byProjectResources:'project'
			sortByPopularDistance:'popular'
			locationObj:{lat:0, lon:0, name:""}
			category:""
			projects:null
			ajax:null
			initSend:true

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@showResources = (window.location.hash.substring(1) is "resources")
				@render()

			events:
				"click .search-catagories li":"categoriesClick"
				"click #modify":"toggleVisibility"
				"click .pill-selection":"pillSelection"
				"click .search-inputs .btn":"sendForm"
				"focus #search-input":"showInput"
				"keypress #search-input":"onInputEnter"
				"keypress #search-near":"onInputEnter"
				
			render: -> 
				@$el = $(".banner-search")
				@$el.template @templateDir+"/templates/partials-discover/banner-search.html",
					data: @viewData, => @onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				# set up zipcode autocomplete
				@$searchInput = $('#search-input')
				@$searchNear  = $('#search-near')
				@$searchNear.typeahead(
					template: '<div class="zip">{{ name }} {{ zip }}</div>'
					engine: Hogan 
					valueKey: 'name'
					name: 'zip'
					remote:
						url: "/api/project/geopoint?s=%QUERY"
						filter: (resp) ->
							zips = []
							if resp.msg.toLowerCase() is "ok" and resp.data.length > 0
								for loc in resp.data
									zips.push {'name':loc.name,'lat':loc.lat,'lon':loc.lon, 'zip':loc.zip}
							zips
				).bind('typeahead:selected', (obj, datum) =>
					@locationObj = datum 
				)

				# deeplink resource select
				if @showResources then $('#sort-by-pr .pill-selection').last().trigger('click')
				
				$dropkick       = $('#search-range').dropkick()
				@$resultsModify = $('.results-modify')
				@$projectList   = $("#projects-list")
				
				@autoGetGeoLocation()
				AbstractView::onTemplateLoad.call @

			autoGetGeoLocation:->
				if navigator.geolocation
					navigator.geolocation.getCurrentPosition (loc)=>
						@handleGetCurrentPosition(loc)
					, @sendForm
				else
					@sendForm()

			handleGetCurrentPosition:(loc)->
				@locationObj.lat = loc.coords.latitude
				@locationObj.lon = loc.coords.longitude

				url = "/api/project/geoname?lat=#{@locationObj.lat}&lon=#{@locationObj.lon}"
				$.get url, (resp) =>
					if resp.success and resp.data.length > 0 then @$searchNear.val resp.data[0].name

				@sendForm()

			categoriesClick:(e)->
				@category = $(e.currentTarget).html()
				@$searchInput.val @category
				$('.search-catagories').hide()

			pillSelection:(e)->
				$this = $(e.currentTarget)
				$this.toggleClass('active')
				$this.siblings().toggleClass('active')

				switch $this.html()
					when 'Projects'
						@byProjectResources = 'project'
						$('#create-project').css('display','block')
						$('#create-resource').hide()
					when 'Resources'
						@byProjectResources = 'resource'
						$('#create-project').hide()
						$('#create-resource').css('display','block')
					when 'Popular'
						@sortByPopularDistance = 'popular'
					when 'Distance'
						@sortByPopularDistance = 'distance'

			showInput:->
				@category = ""
				$('.search-catagories').show()
				
			toggleVisibility:(e)->
				onClick = false
				if e 
					e.preventDefault()
					onClick = true

				@$resultsModify.toggle(!onClick)
				$('.search-toggles').toggle(onClick)
				$('.filter-within').toggle(onClick)

			onInputEnter:(e) ->
				if e.which is 13
					console.log $(".tt-suggestion").first()
					console.log @, @locationObj.name, @$searchInput.val()
					if (@locationObj.name isnt @$searchInput.val() or @locationObj.name is "")
						$(".tt-suggestion").first().trigger "click"
					@sendForm()

			sendForm:(e)->
				if e then e.preventDefault()
				
				$(".search-catagories").hide()
				@$projectList.html("")

				dataObj = {
					s: if @category is "" then @$searchInput.val() else ""
					cat: @category
					loc: @locationObj.name
					d: $("select[name='range']").val()
					type: @byProjectResources  
					lat: @locationObj.lat
					lon: @locationObj.lon
				}

				if @ajax then @ajax.abort()
				@ajax = $.ajax(
					type: "POST"
					url: "/api/project/search"
					data: JSON.stringify(dataObj)
					dataType: "json" 
					contentType: "application/json; charset=utf-8"
				).done (response_)=>
					if response_.success 
						if @initSend is false
							if @locationObj.name isnt "" then @toggleVisibility()
							@$resultsModify.find('input').val @locationObj.name
						@initSend = false

						@index = 0
						@projects = []
						size=0
						for k,v of response_.data
							@projects.push v._id
							size++
						
						@updatePage()
						@setPages size, $(".projects")

						t = if @byProjectResources is 'project' then "Projects" else "Resources"
						$('.projects h4').html(size+" "+t)
						onPageElementsLoad()

						@trigger "ON_RESULTS", size

			updatePage:->
				@$projectList.html("")

				s = @index*@perPage
				e = (@index+1)*@perPage-1
				for i in [s..e]
					if i < @projects.length then @addProject @projects[i]

				$("html, body").animate({ scrollTop: 0 }, "slow")

			addProject:(id_)->
				projectModel = new ProjectModel({id:id_})
				view = new ResourceProjectPreviewView({model:projectModel, parent:"#projects-list"})
				view.fetch()