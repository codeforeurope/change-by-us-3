define ["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel"], (_, Backbone, $, temp, AbstractView, UserModel) ->
  CBUUserView = AbstractView.extend
    
    initialize: (options) ->
      AbstractView::initialize.call @, options

      @model = new UserModel(options.model)
      @model.fetch success: =>
        @render()

    render: ->
      console.log "this.model", @model
 
      @$el = $("<div class='user'/>")
      @$el.template @templateDir + "/templates/partials-user/user.html",
        data: @model.attributes, => @ajaxForm()

      $(@parent).append @$el

    ajaxForm: ->
      $signin = $("form[name=signin]")
      $signin.ajaxForm (response) ->
        console.log response

  # to do
  # if (success){}
  # if (failure){}
  # CBUUserView

