define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "model/ProjectDiscussionModel", 
        "views/partials-project/ProjectSubView", 
        "views/partials-universal/WysiwygFormView", 
        "views/partials-project/ProjectDiscussionThreadItemView"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     ProjectDiscussionModel, 
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
                @templateLoaded = true
                @$ul = @$el.find('.bordered-item')
                @$form = @$el.find(@$threadFormID)
                if @delayedDataLoad then @onSuccess()

                ProjectSubView::onTemplateLoad.call @

            updateDiscussion:(id_)-> 
                @model = new ProjectDiscussionModel({id:id_})
                @model.fetch
                    success:=>
                        if (@templateLoaded is false) then @delayedDataLoad = true else @onSuccess()

            updateCount:(@count)-> 
                title = if @model? then @model.get("title") else ""
                @$el.find(".admin-title").html "All Discussions (#{@count}): #{title}"
            
            onSuccess:->  
                @$ul.html('')
                @$form.html('')
                @updateCount(@count)

                # add discussions
                @addDiscussion @model
                for response in @model.get("responses")
                    model = new ProjectDiscussionModel({id:response.id})
                    @addDiscussion model

                # create Wysiwyg Form
                userAvatar = $('.profile-nav-header img').attr('src')
                dataObj = 
                    parent:@$threadFormID
                    id:@model.get("id")
                    slim:true, userAvatar:userAvatar
                    title:@model.get("title")
                @wysiwygFormView = new WysiwygFormView(dataObj)
                @wysiwygFormView.success = (e)=>
                    if e.success
                        $("#new-thread-editor").html("")
                        model = new ProjectDiscussionModel(e.data)
                        @addDiscussion model

            addDiscussion:(model_)->
                projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView({model:model_})
                @$ul.append projectDiscussionThreadItemView.$el