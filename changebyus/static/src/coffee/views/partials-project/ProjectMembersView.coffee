define ["underscore", "backbone", "jquery", "template", "project-sub-view", "views/partials-project/ProjectMemberListItemView"],
    (_, Backbone, $, temp, ProjectSubView, ProjectMemberListItemView) ->
        ProjectMembersView = ProjectSubView.extend
        
            parent: "#project-members"
            team:[]
            members:[]
            $teamList: null
            $memberList: null
            projectID:0
            isOwner:false
            isOwnerOrganizer:false
            view:"public"

            initialize: (options_) ->
                options           = options_
                @isDataLoaded     = options.isDataLoaded || @isDataLoaded
                @view             = options.view || @view
                @projectID        = options.projectID || @projectID
                @model            = options.model || @model
                @isOwner          = options.isOwner || @isOwner
                @isOwnerOrganizer = options.isOwnerOrganizer || @isOwnerOrganizer

                ProjectSubView::initialize.call(@, options) 

            events:
                "click #alpha":"sortClick" 
                "click #created":"sortClick" 

            render: -> 
                @$el = $(@parent)
                
                @viewData = if @model then @model.attributes else {}
                @viewData.isOwnerOrganizer = @isOwnerOrganizer
                
                templateURL = "partials-project/"
                templateURL += if (@view is "public") then "project-members.html" else "project-members-admin.html"
                @$el.template @templateDir+templateURL, 
                    {data:@viewData}, => @onTemplateLoad() 

            # EVENTS
            # ----------------------------------------------------------------------
            onTemplateLoad:-> 
                @$teamList   = @$el.find("#team-members ul")
                @$memberList = @$el.find("#project-members ul")

                if (@view is "public") and (@collection.length > 0) then @onCollectionLoad()

                ProjectSubView::onTemplateLoad.call @
            
            sortClick:(e)->  
                @addAll $(e.currentTarget).attr("id")
                false

            onCollectionLoad:->
                ProjectSubView::onCollectionLoad.call(@)

                @collection.on('change', =>@addAll()) 
                @collection.on('remove', =>@addAll())

            # ATTACH TEAM MEMBERS
            # ----------------------------------------------------------------------
            addAll: (sort_="alpha") -> 
                @team = []
                @members = []

                # sort all the member by last name or date joined
                $("#"+sort_)
                    .addClass('sort-deactive')
                    .removeClass('ul')
                    .siblings()
                    .removeClass('sort-deactive')
                    .addClass('ul')

                if sort_ is "alpha"
                    # sort by name
                    sortBy = @collection.sortBy (model)->
                        model.get('last_name')
                else
                    # sort by date
                    sortBy = @collection.sortBy (model)->
                        model.get('created_at')
                    sortBy.reverse()

                $.each sortBy, (k, model) => 
                    if model.get("active")
                        roles = model.get("roles")
                        ownerID = if @model then @model.get('owner').id else -1
                         
                        if roles.length is 0 
                            model.set("roles", ["Owner"]) 

                        if ("MEMBER" in roles) or ("Member" in roles)
                            @members.push model
                        else
                            @team.push model

                # attach members to the page
                @$teamList.html('')
                @$memberList.html('')

                # toggle visibility if no members or teams are there
                if @team.length is 0 
                    @$teamList.parent().parent().hide()
                else
                    @$teamList.parent().parent().show()
                    @$teamList.parent().parent().find('h4').html(@team.length+' Person Team')

                if @members.length is 0
                    @$memberList.parent().parent().hide()
                else
                    @$memberList.parent().parent().show()
                    @$memberList.parent().parent().find('h4').html(@members.length+' Members')

                @addTeam(model) for model in @team
                @addMember(model) for model in @members
                ProjectSubView::addAll.call(@)

                @isDataLoaded = true
                @delegateEvents()

            addTeam: (model_) ->  
                view = new ProjectMemberListItemView({model:model_, view:@view, projectID:@projectID})
                @$teamList.append view.$el

            addMember: (model_) ->  
                view = new ProjectMemberListItemView({model:model_, view:@view, projectID:@projectID})
                @$memberList.append view.$el
