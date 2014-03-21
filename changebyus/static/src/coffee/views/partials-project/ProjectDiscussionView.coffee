define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "model/ProjectDiscussionModel",
        "abstract-view",
        "project-sub-view", 
        "views/partials-universal/WysiwygFormView", 
        "views/partials-project/ProjectDiscussionThreadItemView"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     ProjectDiscussionModel,
     AbstractView,
     ProjectSubView,
     WysiwygFormView, 
     ProjectDiscussionThreadItemView) ->
        ProjectDiscussionView = ProjectSubView.extend

            $ul:null
            $form:null
            discussionsCollection:null
            $threadFormID:"#add-thread-form"
            parent: "#project-discussion"
            wysiwygFormView:null
            delayedDataLoad:false
            count:0

            initialize: (options_) ->  
                ProjectSubView::initialize.call(@, options_)

            render: ->
                @$el = $(@parent)
                @$el.template @templateDir+"partials-project/project-discussion.html",
                    {data: @viewData}, => @onTemplateLoad()

            onTemplateLoad:->
                @$form = @$el.find(@$threadFormID)
                
                # user super loadDayTemplate() method
                @loadDayTemplate()

            onDayWrapperLoad:->
                if @delayedDataLoad then @onSuccess()
                AbstractView::onTemplateLoad.call @

            addAll:()-> 
                @$el.find('.day-wrapper').remove()
                @currentDate = ''

                # add discussions 
                for response in @model.get("responses")
                    model = new ProjectDiscussionModel(response)
                    @addOne model
              

            addOne:(model_)->
                m = moment(model_.get("created_at")).format("MMMM D")
                if @currentDate isnt m then @newDay(m)

                projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView({model:model_}) 
                @$ul.append projectDiscussionThreadItemView.$el

                onPageElementsLoad()

            updateDiscussion:(id_)-> 
                @model = new ProjectDiscussionModel({id:id_})
                @model.fetch
                    success:=>
                        @isDataLoaded = true
                        if (@templateLoaded is false) then (@delayedDataLoad = true) else @onSuccess()

            updateCount:(@count)-> 
                title = if @model? then @model.get("title") else ""
                @$el.find(".admin-title").text "All Discussions (#{@count}):   "
                @$el.find(".discussion-title").text title

            onSuccess:-> 
                # add discussions
                @addAll()
                @$form.html('').detach().appendTo(@$el)
                @updateCount(@count)

                # create Wysiwyg Form
                userAvatar = $('.profile-nav-header img').attr('src')
                userName = $('.profile-nav-header span').text()

                dataObj = 
                    parent:@$threadFormID
                    id:@model.get("id")
                    slim:true
                    userAvatar:userAvatar
                    userName:userName
                    title:@model.get("title")
                @wysiwygFormView = new WysiwygFormView(dataObj)
                @wysiwygFormView.success = (e)=>
                    if e.success
                        $("#new-thread-editor").html("")
                        model = new ProjectDiscussionModel(e.data)
                        @addOne model
