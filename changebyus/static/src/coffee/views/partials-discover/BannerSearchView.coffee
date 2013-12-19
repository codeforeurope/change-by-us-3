define ["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view","autocomp", "model/ProjectModel", "resource-project-view"], 
	(_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, ResourceProjectPreviewView) ->
		BannerSearchView = AbstractView.extend

			byProjectResouces:'Projects'
			sortByPopularDistance:'Popular'
			locationObj:null
			ajax:null
			initSend:true

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			events:
				"click .search-catagories li":"categoriesClick"
				"focus #search-input":"showInput"
				"click #modify":"toggleVisibility"
				"click .pill-selection":"pillSelection"
				"click .search-inputs .btn":"sendForm"

			render: -> 
				@$el = $(".banner-search")
				@$el.template @templateDir + "/templates/partials-discover/banner-search.html",
					data: @viewData, => 
						@sendForm()
						@onTemplateLoad()
				$(@parent).append @$el

			onTemplateLoad:->
				$('#search-near').typeahead(
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
					@locationObj = datum
					console.log(datum)
				)

				$dropkick = $('#search-range').dropkick()
				@$resultsModify = $('.results-modify')
				@delegateEvents()
				onPageElementsLoad()

			categoriesClick:(e)->
				$('#search-input').val $(e.currentTarget).html()
				$('.search-catagories').hide()

			pillSelection:(e)->
				$this = $(e.currentTarget)
				$this.toggleClass('active')
				$this.siblings().toggleClass('active')

				switch $this.html()
					when 'Projects'
						@byProjectResouces = 'Projects'
					when 'Resources'
						@byProjectResouces = 'Resources'
					when 'Popular'
						@sortByPopularDistance = 'Popular'
					when 'Distance'
						@sortByPopularDistance = 'Distance'

			showInput:->
				$('.search-catagories').show()

			toggleVisibility:(e)->
				onClick = false
				if e 
					e.preventDefault()
					onClick = true

				@$resultsModify.toggle(!onClick)
				$('.search-toggles').toggle(onClick)
				$('.filter-within').toggle(onClick)

			sendForm:(e)->
				if e then e.preventDefault()
				
				$("#projects-list").html("")

				dataObj = {
					s: $("#search-input").val()
					loc: $("#search-near").val()
					d: $("select[name='range']").val()
					type: @byProjectResouces
					sort: @sortByPopularDistance
					cat:  $("#search-input").val()
				}

				if @ajax then @ajax.abort()
				@ajax = $.ajax(
					type: "POST"
					url: "/api/project/search"
					data: dataObj
				).done (response_)=>
					if response_.success 
						if @initSend is false
							@toggleVisibility()
							@$resultsModify.find('input').val( @locationObj.name )
						@initSend = false

						size=0
						for k,v of response_.data
							console.log "search v ",v
							@addProject v._id
							size++
						$('h4').html(size+" Projects")
						onPageElementsLoad()

			addProject:(id_)->
				projectModel = new ProjectModel({id:id_})
				view = new ResourceProjectPreviewView({model: projectModel, parent: "#projects-list"})
				view.fetch() 