define ["underscore", "backbone", "jquery", "template", "dropkick", "abstract-view","autocomp", "model/ProjectModel", "resource-project-view"], 
    (_, Backbone, $, temp, dropkick, AbstractView, autocomp, ProjectModel, ResourceProjectPreviewView) ->
        BannerSearchView = AbstractView.extend

            byProjectResources:"all"
            sortByPopularDistance:"popular"
            locationObj:{lat:0, lon:0, name:""}
            category:""
            projects:null
            ajax:null
            autoSend:false

            initialize: (options_) ->
                AbstractView::initialize.call @, options_
                @showResources = (window.location.hash.substring(1) is "resources")
                @render()

            events:
                "click .search-catagories li":"onCategoriesClick"
                "click #modify":"onToggleVisibility"
                "click .pill-selection":"onPillSelection"
                "click .search-inputs .btn":"sendForm"
                "click .geo-pin":"onGeoClick"
                "focus #search-input":"onInputFocus"
                "focus #search-near":"onNearFocus"
                "keydown #search-input":"onInputEnter"
                "keydown #search-near":"onInputEnter" 
                
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
                ).bind('typeahead:selected', (obj, datum)=>
                    @locationObj = datum
                )

                # deeplink resource select
                if @showResources then $('#sort-by-pr .pill-selection').last().trigger('click')
                
                @$searchRange      = $('#search-range').dropkick()
                @$resultsModify    = $('.results-modify')
                @$modifyInput      = @$resultsModify.find('input')
                @$projectList      = $("#projects-list")
                @$searchCatagories = $('.search-catagories')
                @$geoPin           = $('.geo-pin')
                
                @addListeners()
                @autoGetGeoLocation()
                AbstractView::onTemplateLoad.call @

            addListeners:->
                @$addOwn = $('#add-own').dropkick({change: (v,l)->
                    window.location.href = "/create/"+v
                })
                @$city = $('#city').dropkick({change: (v,l)->
                    window.location.href = "/city/"+v
                })
                
                @$all       = $('#all')
                @$projects  = $('#projects')
                @$resources = $('#resources')

                @$all.click (e)=> @onToggleClick(e)
                @$projects.click (e)=> @onToggleClick(e)
                @$resources.click (e)=> @onToggleClick(e)

            toggleActive:(dir_)->
                    $li = @$searchCatagories.find('li')
                    hasActive = (@$searchCatagories.find('li.active').length > 0)
                    if dir_ is "up"
                        if hasActive
                            $li.each (i)-> 
                                if $(this).hasClass('active')
                                    $(this).removeClass('active')
                                    newI = if (i is 0) then ($li.length-1) else (i-1)
                                    $($li[newI]).addClass('active')
                                    return false
                        else
                            @$searchCatagories.find('li').last().addClass('active')
                    else
                        if hasActive
                            $li.each (i)->
                                if $(this).hasClass('active')
                                    $(this).removeClass('active') 
                                    newI = if (i < $li.length-1) then i+1 else 0
                                    $($li[newI]).addClass('active')
                                    return false
                        else
                            @$searchCatagories.find('li').first().addClass('active')

            updatePage:->
                @$projectList.html("")

                s = @index*@perPage
                e = (@index+1)*@perPage-1
                for i in [s..e]
                    if i < @projects.length then @addProject @projects[i]

                $("html, body").animate({ scrollTop: 0 }, "slow")

            addProject:(id_)->
                projectModel = new ProjectModel({id:id_})
                view = new ResourceProjectPreviewView({model:projectModel, parent:"#projects-list", isDiscovered:true})
                view.fetch()

            autoGetGeoLocation:->
                if navigator.geolocation
                    navigator.geolocation.getCurrentPosition (loc_)=>
                        @handleGetCurrentPosition(loc_)
                    , @sendForm

            toggleModify:(showSorting_)->
                @$resultsModify.toggle(!showSorting_)
                $('.search-toggles').toggle(showSorting_)
                $('.filter-within').toggle(showSorting_)

            sendForm:(e)->
                if e then e.preventDefault()
                
                @$searchCatagories.hide()
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

                modifyInputVal = @$searchNear.val()

                if @ajax then @ajax.abort()
                @ajax = $.ajax(
                    type: "POST"
                    url: "/api/project/search"
                    data: JSON.stringify(dataObj)
                    dataType: "json" 
                    contentType: "application/json; charset=utf-8"
                ).done (response_)=>
                    if response_.success
                        console.log 'response_',response_, @$searchNear.val()
                        
                        # @toggleModify @autoSend
                        @$modifyInput.val modifyInputVal

                        @autoSend = false
                        @index = 0
                        @projects = []
                        size=0
                        for k,v of response_.data
                            @projects.push v._id
                            size++
                        
                        @updatePage()
                        @setPages size, $(".projects")

                        t = if @byProjectResources is 'project' then "Projects" else if @byProjectResources is 'resource' then "Resources" else "Resources & Projects"
                        $('.projects h4').html(size+" "+t)
                        onPageElementsLoad()

                        @trigger "ON_RESULTS", size

            ### EVENTS ----------------------------------------------------------------- ###
            onInputFocus:->
                @category = ""
                @$searchCatagories.show()

            onNearFocus:->
                @$geoPin.removeClass "active"

            onGeoClick:->
                if navigator.geolocation 
                    @autoGetGeoLocation()

            handleGetCurrentPosition:(loc_)->
                @locationObj.lat = loc_.coords.latitude
                @locationObj.lon = loc_.coords.longitude

                url = "/api/project/geoname?lat=#{@locationObj.lat}&lon=#{@locationObj.lon}"
                if @autoLocation then @autoLocation.abort()
                @autoLocation = $.get url, (resp) =>
                    if resp.success and resp.data.length > 0
                        @autoSend = true
                        @$geoPin.addClass "active"
                        @$searchNear.val resp.data[0].name
                        @sendForm()

            onCategoriesClick:(e)->
                @category = $(e.currentTarget).html()
                @$searchInput.val @category
                @$searchCatagories.hide()

            onPillSelection:(e)->
                $this = $(e.currentTarget)
                $this.toggleClass('active')
                $this.siblings().toggleClass('active')

                switch $this.text()
                    when 'Popular'
                        @sortByPopularDistance = 'popular'
                    when 'Distance'
                        @sortByPopularDistance = 'distance'
 
            onToggleVisibility:(e)->
                @toggleModify true
                e.preventDefault()

            onToggleClick:(e)->
                $('.type-toggle a').removeClass('active')
                $this = $(e.currentTarget)
                $this.addClass('active')

                switch $this.text()
                    when 'Projects'
                        @byProjectResources = 'project' 
                    when 'Resources'
                        @byProjectResources = 'resource' 
                    else
                        @byProjectResources = 'all'

            onInputEnter:(e) ->
                # console.log 'onInputEnter', e.currentTarget
                if e.which is 13
                    if (@locationObj.name isnt @$searchInput.val() or @locationObj.name is "")
                        $(".tt-suggestion").first().trigger "click"

                        if @$searchInput.val() is "" or @$searchCatagories.is(':visible')
                            # console.log @$searchInput.val()
                            # console.log "vis", @$searchCatagories.is(':visible')
                            if @$searchCatagories.find('li.active').length > 0
                                @category = @$searchCatagories.find('li.active').html()
                                @$searchInput.val @category

                    @sendForm()

                if e.which is 38
                    @toggleActive("up")

                if e.which is 40
                    @toggleActive("down")
