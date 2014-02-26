define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "project-sub-view", 
        "views/partials-universal/UpdateListItemView"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     ProjectSubView, 
     UpdateListItemView) ->

        UpdatesView = ProjectSubView.extend

            members: null
            $ul:null
            currentData:"" 
            isResource:false
            isMember:false
            isOwnerOrganizer:false

            initialize: (options_) ->  
                ProjectSubView::initialize.call(@, options_)
                
                @members          = options_.members || @members 
                @isMember         = options_.isMember || @isMember
                @isOwnerOrganizer = options_.isOwnerOrganizer || @isOwnerOrganizer

            render: ->  
                @$el = $(@parent)
                @$el.template @templateDir+"partials-universal/updates.html",
                    {data: @model.attributes}, =>@onTemplateLoad()

            # ATTACH ELEMENTS 
            # ----------------------------------------------------------------------
            addAll: ->
                i = 0
                @$members = @$el.find(".team-members ul")
                @members.each (model) => 
                    if (i++ < 4) then @addMember model
                if i <= 4 then $('.team-members .pull-right').remove()

                @$day = $("<div class='entries-day-wrapper'/>")
                @$day.template @templateDir+"partials-universal/entries-day-wrapper.html",
                    {}, =>@onDayWrapperLoad()

            onDayWrapperLoad: ->  
                ProjectSubView::onDayWrapperLoad.call(@)
                ProjectSubView::addAll.call(@) 

                onPageElementsLoad()

            addOne: (model_) -> 
                m = moment(model_.get("created_at")).format("MMMM D")
                if @currentDate isnt m then @newDay(m)

                console.log 'isOwnerOrganizer ------ ',@isOwnerOrganizer
                view = new UpdateListItemView({model: model_, isMember:@isMember, isOwnerOrganizer:@isOwnerOrganizer})
                @$ul.append view.$el

            addMember: (model_) ->
                if  model_.get("active")
                    roles = model_.get("roles")
                    if roles.length is 0 then model_.set("roles", ["Owner"]) # temp fix
                    if ("MEMBER" in roles) or ("Member" in roles) then return
                    
                    $member = $('<li/>')
                    $member.template @templateDir+"partials-universal/member-avatar.html", {data: model_.attributes}
                    @$members.append $member 

            # use parent method 
            # newDay:(date_)->
