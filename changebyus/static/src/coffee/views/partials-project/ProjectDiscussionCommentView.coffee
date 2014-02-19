define ["underscore", "backbone", "jquery", "template", "abstract-view"], 
    (_, Backbone, $, temp, AbstractView) ->
        ProjectDiscussionCommentView = AbstractView.extend
            parent: "#project"
            
            initialize: (options_) ->
                AbstractView::initialize.call @, options_
                @render()

            render: ->
                @$el = $("<div class='project'/>")
                @$el.template @templateDir+"partials-project/project-discussion-comment.html",
                    {data: @viewData}, => @onTemplateLoad()
                $(@parent).append @$el

