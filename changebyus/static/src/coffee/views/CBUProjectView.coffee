define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-view", 
        "views/partials-project/ProjectCalenderView", 
        "views/partials-project/ProjectMembersView", 
        "views/partials-project/ProjectDonationModalView", 
        "views/partials-universal/UpdatesView",
        "views/partials-universal/WysiwygFormView",
        "model/ProjectModel", 
        "collection/ProjectCalendarCollection", 
        "collection/ProjectMembersCollection", 
        "collection/UpdatesCollection"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     AbstractView, 
     ProjectCalenderView,
     ProjectMembersView, 
     ProjectDonationModalView, 
     UpdatesView, 
     WysiwygFormView, 
     ProjectModel, 
     ProjectCalendarCollection, 
     ProjectMembersCollection, 
     UpdatesCollection) ->
        
        CBUProjectView = AbstractView.extend
            isOwner:false
            isMember:false
            isResource:false
            projectCalenderView: null
            projectMembersView: null
            updatesView: null
            updatesBTN: null
            membersBTN: null
            calendarBTN: null
            memberData: null
            $header:null

            initialize: (options_) -> 
                options      = options_
                @templateDir = options.templateDir or @templateDir
                @parent      = options.parent or @parent
                @model       = new ProjectModel(options.model)
                @collection  = options.collection or @collection
                @isOwner     = options.isOwner || @isOwner
                @isResource  = options.isResource || @isResource
                @model.fetch 
                    success: => @render()

            events:
                "click .flag-project a":"flagProject"
                "click .project-footer .btn":"joinProject"
                "click .donation-header .btn":"onDonateClick"
                "click  a[href^='#']":"changeHash"

            render: ->
                if @isResource
                    className   = "resource-container"
                    templateURL = "/templates/resource.html"
                else
                    className   = "project-container"
                    templateURL = "/templates/project.html"

                @$el = $("<div class='#{className}'/>")
                @$el.template @templateDir+templateURL, 
                    {}, => @onTemplateLoad()
                $(@parent).append @$el

            addHeaderView: -> 
                if @isResource
                    className   = "resource-header"
                    templateURL = "/templates/partials-resource/resource-header.html"
                else
                    className   = "project-header"
                    templateURL = "/templates/partials-project/project-header.html"

                @$header = $("<div class='#{className}'/>")
                @$header.template @templateDir+templateURL, 
                    {data:@viewData}, => @onHeaderLoaded()
                @$el.prepend @$header

            ### EVENTS ---------------------------------------------###
            onTemplateLoad:->
                # determine if user is a member of the project
                # if not, display the join button 
                @viewData = @model.attributes
                @getMemberStatus()

                AbstractView::onTemplateLoad.call @

            onHeaderLoaded:->
                id = @model.get("id")
                config = {id:id}
                
                @updatesCollection        = new UpdatesCollection(config)  
                @projectMembersCollection = new ProjectMembersCollection(config)
                @projectMembersCollection.on "reset", @onCollectionLoad, @
                @projectMembersCollection.fetch {reset: true}

            onCollectionLoad:->  
                parent       = if @isResource then "#resource-updates" else "#project-updates"
                @updatesView = new UpdatesView
                                        model:@model,
                                        collection:@updatesCollection, 
                                        members:@projectMembersCollection, 
                                        isMember:@isMember, 
                                        isOwnerOrganizer:@isOwnerOrganizer, 
                                        isResource:@isResource, 
                                        parent:parent

                if @isResource
                    @updatesView.show()
                    @updatesView.on 'ON_TEMPLATE_LOAD', =>
                        userAvatar = $('.profile-nav-header img').attr('src')
                        @wysiwygFormView = new WysiwygFormView
                                                    parent:"#add-resource-update", 
                                                    id:@model.get("id"), 
                                                    slim:true, 
                                                    userAvatar:userAvatar
                                                    
                else
                    @projectMembersView  = new ProjectMembersView
                                                    model:@model,
                                                    collection:@projectMembersCollection,
                                                    isDataLoaded:true,
                                                    isMember:@isMember
                                                    isOwnerOrganizer:@isOwnerOrganizer,
                                                    isOwner:@isOwner
                                                    
                    @projectCalenderView = new ProjectCalenderView
                                                    model:@model, 
                                                    isMember:@isMember,
                                                    isOwnerOrganizer:@isOwnerOrganizer,
                                                    isOwner:@isOwner
                    
                    @updatesBTN  = $("a[href='#updates']").parent()
                    @membersBTN  = $("a[href='#members']").parent()
                    @calendarBTN = $("a[href='#calendar']").parent()
                    
                    $(window).bind "hashchange", (e) => @toggleSubView()
                    @toggleSubView()

                @delegateEvents()

            flagProject:(e)-> 
                e.preventDefault()
                $.post "/api/project/#{@model.id}/flag", (res_)=>
                    $('.flag-project').css('opacity',0.25)
                    console.log res_

            joinProject:(e)-> 
                e.preventDefault()
                if @isMember then return
                 
                if window.userID is ""
                    window.location = "/login"
                else
                    id    = @model.get("id")
                    $join = $(".project-footer .btn")

                    $.ajax(
                        type: "POST"
                        url: "/api/project/join"
                        data: {project_id:id}
                    ).done (res_)=>
                        if res_.success
                            feedback = 'Following!' # if @isResource then 'Following!' else'Joined!'
                            @isMember = true
                            $join.html(feedback).css('background-color','#e6e6e6')

            onDonateClick:->
                projectDonationModalView = new ProjectDonationModalView({model:@model})
            
            toggleSubView: ->
                view = window.location.hash.substring(1)
                
                for v in [@updatesView, @projectMembersView, @projectCalenderView]
                    v.hide()

                for btn in [@updatesBTN, @membersBTN, @calendarBTN]
                    btn.removeClass "active"

                switch view 
                    when "members"
                        @projectMembersView.show()
                        @membersBTN.addClass "active"
                    when "calendar"
                        @projectCalenderView.show()
                        @calendarBTN.addClass "active"
                    else 
                        @updatesView.show()
                        @updatesBTN.addClass "active"

                onPageElementsLoad()

            ### GETTER & SETTERS ----------------------------------------------------------------- ###
            getMemberStatus:->
                if window.userID is ""
                    @isMember = false
                    @addHeaderView()
                else
                    id = @model.get("id")
                    $.get "/api/project/#{id}/user/#{window.userID}", (res_)=>  
                        if res_.success
                            @memberData                = res_.data
                            @isMember                  = if true in [@memberData.member, @memberData.organizer, @memberData.owner] then true else false
                            @isOwnerOrganizer          = if true in [@memberData.organizer, @memberData.owner] then true else false
                            @viewData.isMember         = @isMember
                            @viewData.isOwnerOrganizer = @isOwnerOrganizer
                            @addHeaderView()
