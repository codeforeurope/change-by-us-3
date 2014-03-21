define ["underscore", "backbone", "jquery", "template", "abstract-modal-view", "zeroclipboard"], 
    (_, Backbone, $, temp, AbstractModalView, ZeroClipboard) ->
        CreateModalView = AbstractModalView.extend
            events:
                _.extend {}, AbstractModalView.prototype.events, {
                    "click #copy-url":"copyUrl",
                    "click #share-url":"onShareUrlClick"
                }

            render: ->
                @$el = $("<div class='modal-fullscreen dark'/>") 
                @$el.template @templateDir+"partials-universal/create-modal.html",
                    {data: @viewData}, => @onTemplateLoad()
                $(@parent).append @$el

            onTemplateLoad:->
                @$initSuccess  = $("#init-success")
                @$shareSuccess = $("#share-success")
                $copyUrl       = $("#copy-url") 
                
                clip           = new ZeroClipboard($copyUrl, {moviePath:"/static/swf/ZeroClipboard.swf"})
                clip.on "load", (client) ->
                    client.on "complete", (client, args) ->
                        $copyUrl.text "Copied!"
                clip.on "noFlash", ()-> noFlash()
                clip.on "wrongFlash", ()-> noFlash()
                
                noFlash = ->
                    $(".modal-links input").css("width","100%")
                    $copyUrl.hide()

                AbstractModalView::onTemplateLoad.call @

            onShareUrlClick:(e)->
                @$initSuccess.hide()
                @$shareSuccess.show()
