define ["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view","autocomp", "model/ProjectModel", "resource-project-view"], 
	(_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, ResourceProjectPreviewView) ->
		BannerSearchView = AbstractView.extend

			byProjectResouces:'Projects'
			sortByPopularDistance:'Popular'
			locationObj:null
			ajax:null

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			events:
				"click .search-catagories li":"categoriesClick"
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
				$searchCatagories = $('.search-catagories')
				$searchInput      = $('#search-input')
				$searchInput.focus ->
					$searchCatagories.show()

				$searchNear = $('#search-near')
				$searchNear.typeahead(
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

				onPageElementsLoad()

				categoriesClick:(e)->
					$searchInput.val $(e.currentTarget).html()
					$searchCatagories.hide()

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

			sendForm:->
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
					if response_.msg.toLowerCase() is "ok"
						size=0
						for k,v of response_.data
							@addProject v._id
							size++
						$('h4').html(size+" Projects")
						onPageElementsLoad()

			addProject:(id_)->
				projectModel = new ProjectModel({id:id_})
				view = new ResourceProjectPreviewView({model: projectModel, parent: "#projects-list"})
				view.fetch() 