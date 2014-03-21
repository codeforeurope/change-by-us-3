define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-view",
        "project-sub-view",
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
                
            # Attach Elements
            # ------------------------------ 
            onDayWrapperLoad:->
                ProjectSubView::onDayWrapperLoad.call(@) 
                ProjectSubView::addAll.call(@) 
                    
                @updateCount()

            addAll: -> 
                if @collection.models.length is 0
                    @$el.template @templateDir+"partials-project/project-zero-discussions.html", 
                        {}, => AbstractView::onTemplateLoad.call @
                else
                    @$el.template @templateDir+"partials-project/project-all-discussions.html",
                        {}, => @loadDayTemplate()
                        # user super loadDayTemplate() method

            addOne:(model_)->
                m = moment(model_.get("created_at")).format("MMMM D")
                if @currentDate isnt m then @newDay(m)

                config = {model:model_}
                projectDiscussionListItemView = new ProjectDiscussionListItemView(config) 
                projectDiscussionListItemView.on 'click', =>
                    @trigger 'DISCUSSION_CLICK', config

                @$ul.append projectDiscussionListItemView.$el

                onPageElementsLoad()

            updateCount:->
                @$el.find(".admin-title").html "All Discussions (#{@collection.models.length})"

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