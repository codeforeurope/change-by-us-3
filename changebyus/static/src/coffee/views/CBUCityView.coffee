define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-view", 
        "resource-project-view",
        "model/ProjectModel",
        "model/CityModel"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     AbstractView, 
     ResourceProjectPreviewView,
     ProjectModel,
     CityModel) ->
        
        CBUCityView = AbstractView.extend

            bothLoaded:0
            delayClear:null
            view:""
            name:""
            projects:[]
            resources:[]
            both:[]

            initialize: (options_) ->
                options = options_
                AbstractView::initialize.call @, options

                @fetch()

            events:
                _.extend {}, AbstractView.prototype.events, {"click .change-city a":"changeCity"}
                
            fetch:->
                $.getJSON "/api/project/cities", (res_)=> 
                    for city in res_.data.cities
                        if @model.id is city.slug 
                            @model = new CityModel(city)
                            @render()
                            break

            render: -> 
                @viewData = @model.attributes 
                s = @viewData.image_url_round
                @viewData.image_url_round= s.substring(s.lastIndexOf("/static/img/"))

                @$el = $("<div class='city-container'/>")
                @$el.template @templateDir+"/templates/city.html", 
                    {data:@viewData}, => @onTemplateLoad()
                $(@parent).append @$el

            search:(type_)->
                dataObj = {
                    s: ""
                    cat: ""
                    loc: ""
                    d: "25"
                    type: type_
                    lon: @model.get("geo_location").coordinates[0]
                    lat: @model.get("geo_location").coordinates[1]
                }

                $.ajax(
                    type: "POST"
                    url: "/api/project/search"
                    data: JSON.stringify(dataObj)
                    dataType: "json"
                    contentType: "application/json; charset=utf-8"
                ).done (response_)=>
                    if response_.success 
                        if type_ is "project"
                            @onProjectsLoad response_.data
                        else
                            @onResourcesLoad response_.data

            addHashListener:->
                $(window).bind "hashchange", (e) => @toggleSubView()
                @toggleSubView()
                
            toggleSubView: ->
                @view = window.location.hash.substring(1)
                @index = 0

                switch @view 
                    when "projects"
                        @showOnlyProjects()
                        @updatePage()
                    when "resources"
                        @showOnlyResources()
                        @updatePage()
                    else 
                        @showBoth()

            loadCityHeader:-> 
                # loop to ensure that a new background is pulled
                if @both.length is 1
                    model = @both[ 0 ]
                    imgURL = model.get "image_url_large_rect"
                else
                    loop
                        model = @both[ window.randomInt(@both.length) ]
                        imgURL = model.get "image_url_large_rect"
                        console.log 'imgURL', imgURL, new Date()
                        break unless @lastImgURL is imgURL 

                @lastImgURL = imgURL
                
                # preload image to memory to ensure smooth fading
                $img = $('<img>').attr('src', imgURL)
                $img.load =>
                    if @$lastFeatured then @$lastFeatured.fadeOut 'slow', -> $(this).remove()
                    @$lastFeatured = $("<div>").addClass("feature-rotating-image")
                    @$featureImage.prepend @$lastFeatured
                    @$lastFeatured.hide().css("background-image", "url(#{imgURL})").fadeIn()

                if @delayClear then clearInterval @delayClear
                @delayClear = delay 10000, => @loadCityHeader()

            showOnlyProjects:->
                @$projectsView.find("ul.projects").html ""
                @$projectsView.find("h2").html "Projects"

                @$projectsView.show()
                @$moreProjects.hide()
                @$resourcesView.hide() 
                @$hr.hide()

                @setPages(@projects.length, @$projectsView.parent())

            showOnlyResources:->
                @$resourcesView.find("ul.resources").html ""
                @$resourcesView.find("h2").html "Resources"

                @$resourcesView.show()
                @$moreResources.hide()
                @$projectsView.hide() 
                @$hr.hide()

                @setPages(@resources.length, @$resourcesView.parent())
                
            showBoth:->
                @$projectsView.find("ul.projects").html ""
                @$resourcesView.find("ul.resources").html ""

                @$projectsView.find("h2").html "Featured Projects"
                @$resourcesView.find("h2").html "Featured Resources"

                if @$paginationContainer then @$paginationContainer.remove()

                # projects
                count = 0
                for v in @projects
                    if count++ < 3 then @addOne v._id, @$projectsView.find("ul.projects")
                
                if count < 3 then @$moreProjects.hide() else @$moreProjects.show()
                if count is 0 then @$projectsView.hide() else @$projectsView.show() 

                # resources
                count = 0
                for v in @resources
                    if count++ < 3 then @addOne v._id, @$resourcesView.find("ul.resources")

                if count < 3 then @$moreResources.hide() else @$moreResources.show()
                if count is 0 then @$resourcesView.hide() else @$resourcesView.show() 

                if @projects.length is 0 or @resources.length is 0 then $('.city-container hr').hide()

            updatePage:->
                if @view is "projects"
                    list = @projects
                    view = @$projectsView.find("ul.projects")
                else 
                    list = @resources
                    view = @$resourcesView.find("ul.resources")

                view.html ""

                s = @index*@perPage
                e = (@index+1)*@perPage-1
                for i in [s..e]
                    if i < list.length then @addOne list[i]._id, view

                $("html, body").animate({ scrollTop: 0 }, "slow")

            addOne: (id_, parent_) -> 
                projectModel = new ProjectModel {id:id_}
                projectModel.bind "change", =>
                    @both.push projectModel

                    if @delayClear then clearInterval @delayClear
                    @delayClear = delay 2000, => @loadCityHeader()

                view = new ResourceProjectPreviewView {model: projectModel, parent:parent_}
                view.fetch()

            ### EVENTS ---------------------------------------------###
            onTemplateLoad:->
                @name = @model.get('name').split(',')[0]

                @$projectsView  = @$el.find('#featured-projects')
                @$resourcesView = @$el.find('#featured-resources')
                @$moreProjects  = @$projectsView.find('.sub-link')
                @$moreResources = @$resourcesView.find('.sub-link')
                @$hr            = $('.city-container hr')

                @$projectsView.find('.sub-link a').html "See More Projects in "+@name
                @$resourcesView.find('.sub-link a').html "See More Resources in "+@name

                $header = $("<div class='city-header'/>")
                $header.template @templateDir+"/templates/partials-city/city-header.html",
                    {data:@viewData}, => @onHeaderLoaded()
                @$el.prepend $header

                AbstractView::onTemplateLoad.call @

            onHeaderLoaded:->
                id = @model.get("id")
                config = {id:id}
                @$featureImage = $(".feature-image")

                @search "project"
                @search "resource"

                @delegateEvents()
                    
            onProjectsLoad:(projects_)-> 
                for k,v of projects_
                    @projects.push v

                @onBothLoaded()

            onResourcesLoad:(resources_)-> 
                for k,v of resources_
                    @resources.push v

                @onBothLoaded()

            onBothLoaded:->
                if ++@bothLoaded is 2 then @addHashListener()
