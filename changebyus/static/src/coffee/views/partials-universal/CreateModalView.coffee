define ["underscore", "backbone", "jquery", "template", "abstract-modal-view"], 
    (_, Backbone, $, temp, AbstractModalView) ->
        CreateModalView = AbstractModalView.extend
        
            render: ->
                @$el = $("<div class='modal-fullscreen dark'/>") 
                @$el.template @templateDir+"partials-universal/create-modal.html",
                    {data: @viewData},  =>@onTemplateLoad()
                $(@parent).append @$el 
