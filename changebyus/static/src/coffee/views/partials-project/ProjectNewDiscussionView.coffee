define ["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-universal/WysiwygFormView"],
    (_, Backbone, $, temp, AbstractView, WysiwygFormView) ->
        ProjectNewDiscussionView = AbstractView.extend

            parent: "#project-new-discussion"
        
            initialize: (options_) -> 
                AbstractView::initialize.call @, options_
                @render()

            events: 
                "click input[value=Cancel]": "cancel"

            render: -> 
                @$el = $(@parent)
                @$el.template @templateDir+"/templates/partials-project/project-new-discussion.html",
                    {data: @viewData}, => @onTemplateLoad()

            onTemplateLoad:->
                form = new WysiwygFormView({parent:"#discussion-form"})
                form.success = (response_) =>
                    form.resetForm()
                    @trigger "NEW_DISCUSSION", response_.data

                AbstractView::onTemplateLoad.call @

            cancel:->
                $("#discussion-editor").html('')
                @$el.find('form').resetForm()
                window.location.hash = 'discussions'
