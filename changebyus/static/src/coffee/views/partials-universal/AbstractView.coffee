define ["underscore", "backbone", "jquery", "template"], 
    (_, Backbone, $, temp) ->
        AbstractView = Backbone.View.extend
            
            parent: "body"
            templateDir: "/static"
            viewData: {}
            templateLoaded: false
            delayedCollectionLoad: false
            $paginationContainer: null
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

            events:
                "click .next-arrow": "nextClick"
                "click .prev-arrow": "prevClick"
                "click .page": "pageClick"

            onTemplateLoad:->
                @trigger 'ON_TEMPLATE_LOAD'
                @templateLoaded = true
                if @delayedCollectionLoad then @loadData()
                @delegateEvents()
                onPageElementsLoad()
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

            nextClick:(e)->
                e.preventDefault()  
                if $(e.currentTarget).hasClass('disabled') is false then @nextPage()

            prevClick:(e)->
                e.preventDefault() 
                if $(e.currentTarget).hasClass('disabled') is false then @prevPage()

            pageClick:(e)->
                e.preventDefault()
                i = $(e.currentTarget).find('a').html()

                if @index isnt (i-1) 
                    @index = (i-1) 
                    @checkArrows()
                    @updatePage()

            nextPage:->
                @index++
                @checkArrows()
                @updatePage()

            prevPage:->
                @index--
                @checkArrows()
                @updatePage()

            updatePage:->
                #override in subview

            checkArrows:->
                $('.pagination li').removeClass('disabled') 

                if @index is @pages-1 then @$nextArrow.addClass('disabled') else @$nextArrow.removeClass('disabled')
                if @index is 0 then @$prevArrow.addClass('disabled') else @$prevArrow.removeClass('disabled')
                
                $("#page-"+(@index+1)).parent().addClass('disabled')

            ### GETTER & SETTERS ----------------------------------------------------------------- ###
            setPages:(total_, parent_=null)->
                $parent = if parent_ then parent_ else @$el
                
                if @$paginationContainer then @$paginationContainer.remove()

                if total_ > @perPage
                    @pages = Math.ceil(total_/@perPage)
                    
                    @$paginationContainer = $("<div class='center'/>")
                    @$pagination          = $("<ul class='pagination'/>")
                    @$prevArrow           = $("<li class='prev-arrow'><a href='#'><img src='/static/img/prev-arrow.png'></a></li>")
                    @$nextArrow           = $("<li class='next-arrow'><a href='#'><img src='/static/img/next-arrow.png'></a></li>")

                    @$pagination.append @$prevArrow
                    for i in [1..@pages]
                        $li = $("<li class='page'><a href='#' id='page-#{i}'>#{i}</a></li>")
                        @$pagination.append $li
                    @$pagination.append @$nextArrow

                    @$paginationContainer.append @$pagination
                    $parent.append @$paginationContainer

                    @delegateEvents()
                    @checkArrows()