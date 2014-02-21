define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "views/partials-project/ProjectSubView", 
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

            initialize: (options_) ->  
                ProjectSubView::initialize.call(@, options_)
                
                @members  = options_.members || @members 
                @isMember = options_.isMember 

            render: ->  
                @$el = $(@parent)
                @$el.template @templateDir+"partials-universal/updates.html",
                    {data: @model.attributes}, =>@onTemplateLoad()

            # ATTACH ELEMENTS 
            # ----------------------------------------------------------------------
            addAll: ->
                @$members = @$el.find(".team-members ul")
                i = 0
                @members.each (model) => 
                    if (i++ < 4) then @addMember model
                if i <= 4 then $('.team-members .pull-right').remove()

                @$day = $('<div />')
                @$day.template @templateDir+"partials-universal/entries-day-wrapper.html",
                    {}, =>@onDayWrapperLoad()

            onDayWrapperLoad: ->  
                if @collection.length > 0
                    model_ = @collection.models[0]
                    m = moment(model_.get("created_at")).format("MMMM D")
                    @newDay(m)

                @isDataLoaded = true
                ProjectSubView::addAll.call(@) 
                onPageElementsLoad()

            addOne: (model_) -> 
                m = moment(model_.get("created_at")).format("MMMM D")
                if @currentDate isnt m then @newDay(m)

                view = new UpdateListItemView({model: model_, isMember:@isMember})
                @$ul.append view.$el

            addMember: (model_) ->
                if  model_.get("active")
                    roles = model_.get("roles")
                    if roles.length is 0 then model_.set("roles", ["Owner"]) # temp fix
                    if ("MEMBER" in roles) or ("Member" in roles) then return
                    
                    $member = $('<li/>')
                    $member.template @templateDir+"partials-universal/member-avatar.html", {data: model_.attributes}
                    @$members.append $member 

            newDay:(date_)-> 
                @currentDate = date_
                @$currentDay = @$day.clone()
                @$el.append @$currentDay
                @$currentDay.find('h4').html(date_)
                @$ul = @$currentDay.find('.bordered-item')  
