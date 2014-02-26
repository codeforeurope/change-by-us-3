define ["underscore", "backbone", "jquery", "template", "form", "abstract-modal-view"], 
    (_, Backbone, $, temp, form, AbstractModalView) ->
        ProjectEmbedCalendarModalView = AbstractModalView.extend
        
            initialize: (options_) ->
                AbstractModalView::initialize.call @, options_
                @viewData.id   = @model.id
                @viewData.slug = @model.slug

            events:
                _.extend {}, AbstractModalView.prototype.events, {"click #modal-does-it-work":"slideToggle"}

            render: ->
                @$el = $("<div class='modal-fullscreen dark'/>") 
                @$el.template @templateDir+"partials-project/project-embed-calendar.html",
                    {data: @viewData}, => @onTemplateLoad()
                $(@parent).append @$el

            onTemplateLoad: ->
                $form = @$el.find('form') 
                @$how = @$el.find('.content-wrapper')

                @$how.hide()

                options =
                    type: $form.attr('method')
                    url: $form.attr('action')
                    dataType: "json" 
                    contentType: "application/json; charset=utf-8"
                    success: (response_) ->
                        if response_.success then window.location.reload()

                $form.submit -> 
                    obj = $form.serializeJSON()
                    json_str = JSON.stringify(obj)
                    options.data = json_str
                    $.ajax options
                    false

                AbstractModalView::onTemplateLoad.call @

            
            slideToggle:(e)-> 
                isExpanded = @$how.is(":visible")
                mt = if isExpanded then -185 else -335
                @$el.find(".embed-modal").css("margin-top", mt)
                @$how.slideToggle()
                @$el.find("form").toggle()
