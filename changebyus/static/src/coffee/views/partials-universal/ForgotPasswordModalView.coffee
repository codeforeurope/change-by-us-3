define ["underscore", "backbone", "jquery", "template", "abstract-modal-view"], 
    (_, Backbone, $, temp, AbstractModalView) ->
        ForgotPasswordModalView = AbstractModalView.extend
        
            render: ->
                @$el = $("<div class='modal-fullscreen dark'/>") 
                @$el.template "/reset",
                    {data: @viewData},  =>@onTemplateLoad()
                $(@parent).append @$el 
