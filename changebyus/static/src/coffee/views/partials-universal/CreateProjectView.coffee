define ["underscore", "backbone", "jquery", "template", "form", "abstract-view"], (_, Backbone, $, temp, form, AbstractView) ->
  CreateProjectView = AbstractView.extend
    initialize: (options) ->
      AbstractView::initialize.call @, options
      @render()

    render: ->
      self = this
      @$el = $("<div class='create-project'/>")
      @$el.template @templateDir + "/templates/partials-universal/create-form.html",
        data: @viewData
      , ->
        self.ajaxForm()

      $(@parent).append @$el

    ajaxForm: ->
      $submit = $("input[type=submit]")
      $form = $("form[name=createproject]")
      options =
        beforeSubmit: ->
          $submit.prop "disabled", true

        success: (res) ->
          console.log "res", res
          # createProjectModalView = new CreateProjectView(viewData: res)
          $submit.prop "disabled", false
          $form.resetForm()  if res.success

      $form.ajaxForm options

