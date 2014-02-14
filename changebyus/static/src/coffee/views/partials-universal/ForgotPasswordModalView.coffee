define ["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "abstract-modal-view"], 
    (_, 
     Backbone, 
     $, 
     temp, 
     AbstractModalView) ->
        ForgotPasswordModalView = AbstractModalView.extend

            render: -> 
                @$el = $("<div class='modal-fullscreen dark'/>") 
                @$el.template ("/reset"),
                    {data: @viewData},  =>@onTemplateLoad()
                $(@parent).append @$el 

            onTemplateLoad:->
                AbstractModalView::onTemplateLoad.call @
                @ajaxForm()

            ajaxForm:->
                self    = @
                $form   = $("form[name=forgot_password_form]") 
                $inputs = $form.find("input, textarea")
                options =
                    type: $form.attr('method')
                    url: $form.attr('action')

                    beforeSubmit:(arr_, form_, options_)->  
                        if $form.valid()
                            $inputs.attr("disabled", "disabled")
                            return true
                        else
                            return false

                    success: (res) -> 
                        self.$el.html res
                        self.onTemplateLoad()

                $form.ajaxForm options
