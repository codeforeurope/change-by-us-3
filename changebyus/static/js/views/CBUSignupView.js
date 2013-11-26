define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var CBUSignupView;
  return CBUSignupView = AbstractView.extend({
    socialInfo: null,
    initialize: function(options) {
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='signup'/>");
      this.$el.template(this.templateDir + "/templates/signup.html", {
        data: this.viewData
      }, function() {
        _this.ajaxForm();
        _this.addListeners();
        return onPageElementsLoad();
      });
      return $(this.parent).append(this.$el);
    },
    addListeners: function() {
      var _this = this;
      $(".btn-info").click(function(e) {
        var url;
        e.preventDefault();
        url = $(this).attr("href");
        return popWindow(url);
      });
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      return this.toggleSubView();
    },
    ajaxForm: function() {
      var $feedback, $form, $signup, $socialFeedback, $socialForm, $socialSignup, $socialSubmit, $submit, options,
        _this = this;
      $signup = $(".init-signup");
      $form = $signup.find("form");
      $submit = $signup.find("input[type='submit']");
      $feedback = $signup.find(".login-feedback");
      options = {
        beforeSubmit: function() {
          console.log('beforeSubmit');
          $form.find("input, textarea").attr("disabled", "disabled");
          return $feedback.removeClass("alert").removeClass("alert-danger").html("");
        },
        success: function(response) {
          console.log('signup', response);
          $form.find("input, textarea").removeAttr("disabled");
          if (response.msg.toLowerCase() === "ok") {
            return window.location.href = "/";
          } else {
            return $feedback.addClass("alert").addClass("alert-danger").html(response.msg);
          }
        }
      };
      $form.ajaxForm(options);
      $socialSignup = $(".social-signup");
      $socialForm = $socialSignup.find("form");
      $socialSubmit = $socialSignup.find("input[type='submit']");
      $socialFeedback = $socialSignup.find(".login-feedback");
      options = {
        beforeSubmit: function() {
          console.log('beforeSubmit');
          $socialForm.find("input, textarea").attr("disabled", "disabled");
          return $socialFeedback.removeClass("alert").html("");
        },
        success: function(response) {
          console.log('signup', response);
          $socialForm.find("input, textarea").removeAttr("disabled");
          if (response.msg.toLowerCase() === "ok") {
            return window.location.href = "/";
          } else {
            return $socialFeedback.addClass("alert").html(response.msg);
          }
        }
      };
      return $socialForm.ajaxForm(options);
    },
    toggleSubView: function() {
      var view;
      view = window.location.hash.substring(1);
      if (view === "facebook" || view === "twitter") {
        $('.social-signup').show();
        $('.init-signup').hide();
        return this.getSocialInfo();
      } else {
        $('.social-signup').hide();
        return $('.init-signup').show();
      }
    },
    getSocialInfo: function() {
      var $socialForm, $socialSignup,
        _this = this;
      if (!this.socialInfo) {
        $socialSignup = $(".social-signup");
        $socialForm = $socialSignup.find("form");
        $socialForm.find("input, textarea").attr("disabled", "disabled");
        if (this.ajax) {
          this.ajax.abort();
        }
        return this.ajax = $.ajax({
          type: "GET",
          url: "/api/user/socialinfo"
        }).done(function(response_) {
          console.log("response_", response_);
          if (response_.msg.toLowerCase() === "ok") {
            _this.setSocialInfo(response_.data);
          }
          return $socialForm.find("input, textarea").removeAttr("disabled");
        });
      }
    },
    setSocialInfo: function(data_) {
      var $socialAvatar, $socialSignup, img, name;
      this.socialInfo = data_;
      img = this.socialInfo.fb_image !== "" ? this.socialInfo.fb_image : this.socialInfo.twitter_image;
      name = this.socialInfo.fb_name !== "" ? this.socialInfo.fb_name : this.socialInfo.twitter_name;
      $socialAvatar = $('.social-avatar');
      $socialSignup = $(".social-signup");
      $socialAvatar.find('img').attr('src', img);
      $socialAvatar.find('span').html(name);
      $socialSignup.find('input[name="id"]').val(this.socialInfo.id);
      if (this.socialInfo.email !== "None") {
        $socialSignup.find('input[name="email"]').val(this.socialInfo.email);
      }
      $socialSignup.find('input[name="display_name"]').val(this.socialInfo.display_name);
      return console.log(this.socialInfo, $('.social-avatar').find('img'));
    }
  });
});
