define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-view", 
        "views/partials-project/ProjectSubView",
        "views/partials-universal/WysiwygFormView",
        "views/partials-universal/UpdateListItemView",
        "views/partials-project/ProjectUpdateSuccessModalView"],
    (_, 
     Backbone, 
     $, 
     temp, 
     AbstractView, 
     ProjectSubView, 
     WysiwygFormView, 
     UpdateListItemView, 
     ProjectUpdateSuccessModalView) ->

        ProjectAddUpdateView = ProjectSubView.extend

            parent: "#project-update"

            events: 
                "click #post-update":"animateUp"
                "click .share-toggle":"shareToggle"
                "click .share-options .styledCheckbox":"shareOption"

            render: -> 
                @$el = $(@parent)
                @viewData.image_url_round_small = $('.profile-nav-header img').attr('src')
                @$el.template @templateDir+"partials-project/project-add-update.html",
                    {data: @viewData}, => @onTemplateLoad()

                self = @
                document.windowReload = -> self.getSocial(false)

            onTemplateLoad:-> 
                @$ul = @$el.find('.updates-container ul')
                
                @getSocial()

                ProjectSubView::onTemplateLoad.call @

            getSocial:(addForm_=true)->
                # check to see if social accounts are linked and hide the share options if they aren't
                $.get "/api/user/socialinfo", (response_)=>
                    try
                        @socialInfo = response_.data
                        if addForm_ then @addForm() else @checkSocial(true)
                    catch e
                        console.log 'getSocial ERROR:', e

            shareToggle:->
                $(".share-options").toggleClass("hide")

            shareOption:(e)->
                checked = []
                $.each $('.share-options input'), ->
                    $this = $(this)
                    id = $this.attr('id')
                    if ($this.is(':checked')) then checked.push id
                         
                $('#social_sharing').val checked.join()

            addForm:->
                form = new WysiwygFormView({parent:"#update-form"})
                form.on 'ON_TEMPLATE_LOAD', =>  
                    $feedback       = $("#feedback").hide()
                    $submit         = form.$el.find('input[type="submit"]')
                    $inputs         = $submit.find("input, textarea")
                    @$facebook      = $("#facebook")
                    @$twitter       = $("#twitter")
                    @$facebookLabel = $("label[for=facebook]")
                    @$twitterLabel  = $("label[for=twitter]")
                    
                    form.beforeSubmit = (arr_, form_, options_)-> 
                        $feedback.hide()
                        $inputs.attr("disabled", "disabled")

                    form.success = (response_)=> 
                        if response_.success
                            @addModal response_.data

                        form.resetForm()
                        $("#editor").html("")
                        $inputs.removeAttr("disabled")

                    form.error = (error_)=>
                        $feedback.show()
                        console.log 'error response_',error_

                    @$el.find('input:radio, input:checkbox').screwDefaultButtons
                        image: 'url("/static/img/black-check.png")'
                        width: 18
                        height: 18

                    @checkSocial()
                    @delegateEvents()

            checkSocial:(forceClick_=false)->
                if @socialInfo.fb_name is ""
                    @$facebook.screwDefaultButtons("disable")
                    @$facebook.parent().click ()=> @socialClick("facebook")
                    @$facebookLabel.addClass("disabled-btn").click ()=> @socialClick("facebook")
                else
                    @$facebook.screwDefaultButtons("enable")
                    if forceClick_ then @$facebook.screwDefaultButtons("check")
                    @$facebookLabel.removeClass("disabled-btn").unbind "click"

                if @socialInfo.twitter_name is ""
                    @$twitter.screwDefaultButtons("disable")
                    @$twitter.parent().click ()=> @socialClick("twitter")
                    @$twitterLabel.addClass("disabled-btn").click ()=> @socialClick("twitter")
                else
                    @$twitter.screwDefaultButtons("enable")
                    if forceClick_ then @$twitter.screwDefaultButtons("check")
                    @$twitterLabel.removeClass("disabled-btn").unbind "click"

            addAll: ->  
                @$day = $('<div />')
                @$day.template @templateDir+"partials-universal/entries-day-wrapper.html",
                    {}, => @onDayWrapperLoad()

            onDayWrapperLoad: ->  
                if @collection.length > 0
                    model_ = @collection.models[0]
                    m = moment(model_.get("created_at")).format("MMMM D")
                    @newDay(m)

                @isDataLoaded = true
                ProjectSubView::addAll.call(@) 
                onPageElementsLoad()

            newDay:(date_)-> 
                @currentDate = date_
                @$currentDay = @$day.clone()
                @$el.append @$currentDay
                @$currentDay.find('h4').html(date_)
                @$ul = @$currentDay.find('.bordered-item') 
                    
            addOne: (model_) ->
                m = moment(model_.get("created_at")).format("MMMM D")
                if @currentDate isnt m then @newDay(m) 
                view = new UpdateListItemView({model: model_})
                @$ul.append view.$el 

            addModal:(data_)-> 
                data_.twitter_name = @socialInfo.twitter_name
                data_.slug         = @model.get("slug")
                modal              = new ProjectUpdateSuccessModalView({model:data_})

            animateUp:->
                $("html, body").animate({ scrollTop: 0 }, "slow")

            socialClick:(site_)->
                popWindow "/social/#{site_}/link"
