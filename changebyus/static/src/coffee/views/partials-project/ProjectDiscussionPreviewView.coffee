define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
    (_, Backbone, $, temp, AbstractView) ->
        ProjectDiscussionPreviewView = AbstractView.extend

            initialize: (options_) ->
                AbstractView::initialize.call @, options_
                @render()

            render: ->
                @$el = $("<div class='project'/>")
                @$el.template @templateDir+"partials-project/project-discussion-preview.html",
                    {data: @viewData}, =>@ajaxForm()
                $(@parent).append @$el