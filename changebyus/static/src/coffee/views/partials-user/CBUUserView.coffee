define ["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel"], (_, Backbone, $, temp, AbstractView, UserModel) ->
  CBUUserView = AbstractView.extend(
    initialize: (options) ->
      AbstractView::initialize.apply this, options
      self = this
      console.log "options.model", options.model
      @model = new UserModel(options.model)
      @model.fetch success: ->
        self.render()


    render: ->
      console.log "this.model", @model
      self = this
      @$el = $("<div class='user'/>")
      @$el.template @templateDir + "/templates/partials-user/user.html",
        data: @model.attributes
      , ->
        self.ajaxForm()

      $(@parent).append @$el

    ajaxForm: ->
      $signin = $("form[name=signin]")
      $signin.ajaxForm (response) ->
        console.log response

  )
  
  # to do
  # if (success){}
  # if (failure){}
  CBUUserView

