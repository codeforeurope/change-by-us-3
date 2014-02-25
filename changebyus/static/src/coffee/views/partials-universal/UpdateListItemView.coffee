define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "moment", 
        "abstract-view", 
        "model/UpdateModel", 
        "model/UserModel",
        "views/partials-universal/PostReplyView"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     moment, 
     AbstractView, 
     UpdateModel, 
     UserModel,
     PostReplyView) ->
        UpdateListItemView = AbstractView.extend
            
            model:UpdateModel
            isStream:false
            isMember:false
            $repliesHolder: null
            $postRight: null
            $replyForm: null 

            initialize: (options_) ->
                options   = options_
                AbstractView::initialize.call @, options
                @viewData = @model.attributes
                @isMember = options.isMember
                @isStream = options.isStream || @isStream

                @el  = if @isStream then $('<div/>').addClass('content-wrapper') else $('<li/>')
                @$el = $(@el)
 
                @user = new UserModel(id:@model.get("user").id)
                @user.fetch
                    success: =>@render()

            events:
                "click .reply-toggle:first":"onReplyToggleClick"

            render: ->
                @viewData.image_url_round_small = @user.get("image_url_round_small")
                @viewData.display_name          = @user.get("display_name")
                
                m = moment(@model.get("created_at")).format("MMMM D hh:mm a")
                @model.set("format_date", m)

                @$el.template @templateDir+"partials-universal/update-list-item.html",
                    {data:@viewData}, => @onTemplateLoad()

            onTemplateLoad:-> 
                if @isStream
                    projectName   = @model.get("project").name
                    projectSlug   = @model.get("project").slug
                    $projectTitle = $("<div/>").addClass("project-name-corner")
                    $projectTitle.html("<a href='/project/#{projectSlug}'>#{projectName}</a>")
                    @$el.append $projectTitle

                @$el.find('img').load -> onPageElementsLoad()
                @addReplies()

                AbstractView::onTemplateLoad.call @

            # Attach Elements
            # --------------------------------------------

            addReplies:->
                @$repliesHolder = $('<ul class="content-wrapper bordered-item np top-caret hide"/>')

                @addReply(reply) for reply in @model.get('responses') 

                viewData = @model.attributes
                viewData.image_url_round_small = $('.profile-nav-header img').attr('src')
            
                if @isMember
                    @$replyForm = $('<li class="post-reply-form"/>')
                    @$replyForm.template @templateDir+"partials-universal/post-reply-form.html",
                        {data:viewData}, => @onFormLoaded()
                    @$repliesHolder.append @$replyForm

                @$el.find('.update-content').append @$repliesHolder

            addReply:(reply_)->
                postReplyView = new PostReplyView({model:reply_})
                replyForm = @$el.find('.post-reply-form')
                if replyForm.length > 0
                    postReplyView.$el.insertBefore replyForm
                else
                    @$repliesHolder.append postReplyView.$el

            # EVENTS 
            # ---------------------------------------------
            onReplyToggleClick:(e)->
                $(e.currentTarget).find('.reply').toggleClass('hide')
                @$repliesHolder.toggleClass('hide')

            onFormLoaded:-> 
                $form = @$replyForm.find('form')
                
                options =
                    type: $form.attr('method')
                    url: $form.attr('action')
                    dataType: "json" 
                    contentType: "application/json; charset=utf-8"
                    success: (response_) => 
                        $form.find('form').resetForm()
                        @addReply response_.data

                $form.submit -> 
                    obj = $form.serializeJSON()
                    json_str = JSON.stringify(obj)
                    options.data = json_str
                    $.ajax options
                    false