define ["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view","autocomp", "model/ProjectModel", "resource-project-view"], 
	(_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, ResourceProjectPreviewView) ->
		BannerSearchView = AbstractView.extend

			sortByProjectResouces:'Projects'
			sortByPopularDistance:'Popular'
			locationObj:null
			ajax:null

			initialize: (options) ->
				AbstractView::initialize.call @, options
				@render()

			render: -> 
				@$el = $("<div class='banner-search'/>")
				@$el.template @templateDir + "/templates/partials-discover/banner-search.html",
					data: @viewData, => 
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

				$('.search-catagories li').click ->
					$searchInput.val $(this).html()
					$searchCatagories.hide()

				$('.pill-selection').click ->
					$this = $(this)
					$this.toggleClass('active')
					$this.siblings().toggleClass('active')

					switch $this.html()
						when 'Projects'
							@sortByProjectResouces = 'Projects'
						when 'Resources'
							@sortByProjectResouces = 'Resources'
						when 'Popular'
							@sortByPopularDistance = 'Popular'
						when 'Distance'
							@sortByPopularDistance = 'Distance'

				$('.search-inputs .btn').click => @sendForm()

			sendForm:->
				dataObj = {
					s: $("#search-input").val()
					loc: $("#search-near").val()
					d: $("select[name='range']").val()
					type: @sortByProjectResouces
					cat: @sortByPopularDistance
				}

				if @ajax then @ajax.abort()
				@ajax = $.ajax(
					type: "POST"
					url: "/api/project/search"
					data: dataObj
				).done (response_)=>
					if response_.msg.toLowerCase() is "ok"
						for k,v of response_.data
							@addProject v._id

			addProject:(id_)->
				projectModel = new ProjectModel({id:id_})
				view = new ResourceProjectPreviewView({model: projectModel, parent: "#projects-list"})
				view.fetch()

				#console.log 'projectModel',projectModel,'view',view,'id_',id_