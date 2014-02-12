define ["underscore", "backbone", "jquery", "template", "validate", "abstract-view", "views/partials-universal/ForgotPasswordModalView"], 
    (_, Backbone, $, temp, valid, AbstractView, ForgotPasswordModalView) ->
        CBUDLoginView = AbstractView.extend
            
            # token: null

            initialize: (options_) -> 
                # @token = options_.token || @token
                AbstractView::initialize.call @, options_
                @render()

            events:
                "click .btn-info":"popUp"
                "click #forgot-password":"forgotPassword"

            render: -> 
                @$el = $("<div class='login'/>")
                @$el.template @templateDir+"/templates/login.html",
                    data: @viewData, => @onTemplateLoad() 
                $(@parent).append @$el

            onTemplateLoad:->
                AbstractView::onTemplateLoad.call @

                @ajaxForm() 
                onPageElementsLoad()
                #if @token isnt null
                #    forgotPasswordModalView = new ForgotPasswordModalView(@token)

            popUp:(e)->
                e.preventDefault()
                url = $(e.currentTarget).attr("href")
                popWindow url

            forgotPassword:(e)->
                e.preventDefault()
                forgotPasswordModalView = new ForgotPasswordModalView()

            ajaxForm: -> 
                $submit   = $("input[type='submit']")
                $form     = $("form")
                $feedback = $(".login-feedback")
                options   =
                    type: $form.attr('method')
                    url: $form.attr('action')
                    dataType: "json" 
                    contentType: "application/json; charset=utf-8"
                    beforeSend: => 
                        if $form.valid()
                            $form.find("input, textarea").attr("disabled", "disabled")
                            $feedback.removeClass("alert").removeClass("alert-danger").html ""
                            return true
                        else
                            return false

                    success: (response_) =>
                        $form.find("input, textarea").removeAttr("disabled")

                        if response_.success
                            window.location.href = "/stream/dashboard"
                        else
                            $feedback.addClass("alert").addClass("alert-danger").html response_.msg

                $form.submit ->
                    json_str = JSON.stringify($form.serializeJSON())
                    options.data = json_str
                    $.ajax options
                    false