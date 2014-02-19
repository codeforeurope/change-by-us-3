define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-view",
        "views/partials-project/ProjectSubView",
        "views/partials-project/ProjectDiscussionListItemView"],
    (_, 
     Backbone, 
     $, 
     temp, 
     AbstractView,
     ProjectSubView, 
     ProjectDiscussionListItemView) ->

        ProjectDiscussionsView = ProjectSubView.extend

            parent: "#project-discussions"
            $ul:null
            currentData:""

            render: ->
                @$el = $(@parent)
                @templateLoaded = true

            onCollectionLoad:->  
                ProjectSubView::onCollectionLoad.call(@)

                @collection.on 'add', @updateCount, @
                @collection.on 'remove', (obj_)=>
                    @addAll()
                    @deleteDiscussion(obj_.id)
                
            addAll: -> 
                if @collection.models.length is 0
                    @$el.template @templateDir+"partials-project/project-zero-discussions.html", 
                        {}, => AbstractView::onTemplateLoad.call @
                else
                    @$el.template @templateDir+"partials-project/project-all-discussions.html",
                        {}, => @loadDayTemplate()

            loadDayTemplate:->
                @$day = $('<div class="day-wrapper"/>')
                @$day.template @templateDir+"partials-universal/entries-day-wrapper.html",
                    {}, => @onDayWrapperLoad()

            onDayWrapperLoad:->
                @isDataLoaded = true

                if @collection.length > 0
                    model_ = @collection.models[0]
                    m = moment(model_.get("created_at")).format("MMMM D")
                    @newDay(m)
                    
                @updateCount()

                ProjectSubView::addAll.call(@) 

            updateCount:->
                @$el.find(".admin-title").html "All Discussions (#{@collection.models.length})"

            newDay:(date_)->
                @currentDate = date_
                @$currentDay = @$day.clone()
                @$el.append @$currentDay
                @$currentDay.find('h4').html(date_)
                @$ul = @$currentDay.find('.bordered-item') 

            addOne:(model_)->
                m = moment(model_.get("created_at")).format("MMMM D")
                if @currentDate isnt m then @newDay(m)

                config = {model:model_}
                projectDiscussionListItemView = new ProjectDiscussionListItemView(config) 
                projectDiscussionListItemView.on 'click', =>
                    @trigger 'DISCUSSION_CLICK', config

                @$ul.append projectDiscussionListItemView.$el

                onPageElementsLoad()

            show:->
                $(".day-wrapper").remove()
                ProjectSubView::show.call(@)
                @loadData()

            deleteDiscussion:(id_)->
                $feedback = $("#discussions-feedback")
                $.ajax(
                    type: "POST"
                    url: "/api/post/delete"
                    data: { post_id:id_ }
                ).done (res_)=> 
                    if res_.success
                        $feedback.hide()
                    else
                        $feedback.show().html(res_.msg)