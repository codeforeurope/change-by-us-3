define ["underscore", "backbone", "jquery", "template"], (_, Backbone, $, temp) ->
  popWindow = (url) ->
    title = "social"
    w = 650
    h = 650
    left = (screen.width / 2) - (w / 2)
    top = (screen.height / 2) - (h / 2)
    window.open url, title, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left
  
  CBUDLoginView = Backbone.View.extend(
    parent: "body"
    templateDir: "/static"
    viewData: {}
    $submit: null
    
    initialize: (options) ->
      @templateDir = options.templateDir or @templateDir
      @parent = options.parent or @parent
      @viewData = options.viewData or @viewData
      @render()

    render: ->
      self = this
      @$el = $("<div class='login'/>")
      @$el.template @templateDir + "/templates/login.html",
        data: @viewData
      , ->
        self.$submit = $("input[type=\"submit\"]")
        self.ajaxForm()
        self.addListeners()

      $(@parent).append @$el

    addListeners: ->
      $(".btn-info").click (e) ->
        e.preventDefault()
        url = $(this).attr("href")
        popWindow url


    ajaxForm: ->
      self = this
      $login = $("form[name=signin]")
      $feedback = $("#login-feedback")
      options =
        beforeSubmit: ->
          self.$submit.prop "disabled", true
          $feedback.removeClass("alert").html ""

        success: (response) ->
          self.$submit.prop "disabled", false
          if response.msg.toLowerCase() is "ok"
            window.location.href = "/"
          else
            $feedback.addClass("alert").html response.msg

      $login.ajaxForm options
  )
  CBUDLoginView

