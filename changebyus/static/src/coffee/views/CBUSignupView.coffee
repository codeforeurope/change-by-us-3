define ["underscore", "backbone", "jquery", "template"], (_, Backbone, $, temp) ->
  
  # to do
  # if (success){}
  # if (failure){} 
  popWindow = (url) ->
    title = "social"
    w = 650
    h = 650
    left = (screen.width / 2) - (w / 2)
    top = (screen.height / 2) - (h / 2)
    window.open url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left
  CBUSignupView = Backbone.View.extend(
    parent: "body"
    templateDir: "/static"
    viewData: {}
    initialize: (options) ->
      @templateDir = options.templateDir or @templateDir
      @parent = options.parent or @parent
      @viewData = options.viewData or @viewData
      @render()

    render: ->
      self = this
      @$el = $("<div class='signup'/>")
      @$el.template @templateDir + "/templates/signup.html",
        data: @viewData
      , ->
        self.ajaxForm()
        self.addListeners()

      $(@parent).append @$el

    addListeners: ->
      $(".btn-info").click (e) ->
        e.preventDefault()
        url = $(this).attr("href")
        popWindow url


    ajaxForm: ->
      $signin = $("form[name=signin]")
      $signin.ajaxForm (response) ->
        console.log response

  )
  CBUSignupView

