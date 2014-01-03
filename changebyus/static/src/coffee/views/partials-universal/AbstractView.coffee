define ["underscore", "backbone", "jquery", "template"], 
	(_, Backbone, $, temp) ->
		AbstractView = Backbone.View.extend
			
			parent: "body"
			templateDir: "/static"
			viewData: {}
			templateLoaded: false
			delayedCollectionLoad: false
			id: 0
			results:[]
			index:0
			perPage:12
			pages:0

			initialize: (options_) ->
				options      = options_ or {}
				@id          = options.id or @id
				@templateDir = options.templateDir or @templateDir
				@parent      = options.parent or @parent
				@viewData    = options.viewData or @viewData

			onTemplateLoad:->
				@trigger 'ON_TEMPLATE_LOAD'
				@templateLoaded = true
				if @delayedCollectionLoad then @loadData()
				@delegateEvents()
				#override in subview

			changeHash:(e)-> 
				# hack to override backbone router
				window.location.hash = $(e.currentTarget).attr("href").substring(1)
			
			show: ->
				@$el.show()

			hide: ->
				@$el.hide()

			fetch:->
				@model.fetch
					success:(r)=>
						@onFetch r 

			onFetch:(r)->
				#hook 

			setPages:(total, parent_=null)->
				$parent = if parent_ then parent_ else @$el
				console.log 'setPages',$parent
				if total > @perPage
					@pages = Math.ceil(total/@perPage)
					
					@$paginationContainer = $("<div class='center'/>")
					@$pagination          = $("<ul class='pagination'/>")
					@$prevArrow           = $("<li class='prev-arrow'><a href='#'>&laquo;</a></li>")
					@$nextArrow           = $("<li class='next-arrow'><a href='#'>&raquo;</a></li>")

					@$prevArrow.click (e)=> 
						e.preventDefault()
						if $(e.currentTarget).hasClass('disabled') is false then @prevPage()

					@$nextArrow.click (e)=> 
						e.preventDefault()
						if $(e.currentTarget).hasClass('disabled') is false then @nextPage()


					@$pagination.append @$prevArrow
					for i in [1..@pages]
						$li = $("<li class='page'><a href='#'>"+i+"</a></li>")
						$li.click (e)=> 
							e.preventDefault()
							i = $(e.currentTarget).find('a').html()
							@pageClick(i)
						@$pagination.append $li
					@$pagination.append @$nextArrow

					@$paginationContainer.append @$pagination
					$parent.append @$paginationContainer

					@checkArrows()


			nextPage:->
				@index++
				@checkArrows()
				@updatePage()

			prevPage:(e)->
				@index--
				@checkArrows()
				@updatePage()

			updatePage:->
				#override in subview

			pageClick:(i)->
				if @index isnt (i-1) 
					@index = (i-1) 
					@checkArrows()
					@updatePage()

			checkArrows:->
				if @index is @pages-1 then @$nextArrow.addClass('disabled') else @$nextArrow.removeClass('disabled')
				if @index is 0 then @$prevArrow.addClass('disabled') else @$prevArrow.removeClass('disabled')

