define(["underscore", "backbone", "jquery", "template", "abstract-view", "serializeJSON"], function(_, Backbone, $, temp, AbstractView, serialize) {
  var CBUSignupView;
  return CBUSignupView = AbstractView.extend({
    socialInfo: null,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
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
      var $feedback, $form, $signup, $socialFeedback, $socialForm, $socialSignup, $socialSubmit, $submit, options, socialOptions,
        _this = this;
      $signup = $(".init-signup");
      $form = $signup.find("form");
      $submit = $signup.find("input[type='submit']");
      $feedback = $signup.find(".login-feedback");
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function() {
          $form.find("input, textarea").attr("disabled", "disabled");
          return $feedback.removeClass("alert").removeClass("alert-danger").html("");
        },
        success: function(response) {
          console.log('signup', response);
          $form.find("input, textarea").removeAttr("disabled");
          if (response.success) {
            return window.location.href = "/";
          } else {
            return $feedback.addClass("alert").addClass("alert-danger").html(response.msg);
          }
        }
      };
      $form.submit(function() {
        var json_str;
        json_str = JSON.stringify($form.serializeJSON());
        options.data = json_str;
        console.log('options.data', options.data);
        $.ajax(options);
        return false;
      });
      $socialSignup = $(".social-signup");
      $socialForm = $socialSignup.find("form");
      $socialSubmit = $socialSignup.find("input[type='submit']");
      $socialFeedback = $socialSignup.find(".login-feedback");
      console.log($socialFeedback);
      $socialSignup.hide();
      socialOptions = {
        type: $socialForm.attr('method'),
        url: $socialForm.attr('action'),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function() {
          $socialForm.find("input, textarea").attr("disabled", "disabled");
          return $socialFeedback.removeClass("alert").html("");
        },
        success: function(response) {
          console.log('signup', response, $socialFeedback);
          $socialForm.find("input, textarea").removeAttr("disabled");
          if (response.success === "ok") {
            return window.location.href = "/";
          } else {
            return $socialFeedback.addClass("alert").html(response.msg);
          }
        }
      };
      return $socialForm.submit(function() {
        var json_str, obj;
        obj = $socialForm.serializeJSON();
        if (obj.public_email === "on") {
          obj.public_email = true;
        } else {
          obj.public_email = false;
        }
        json_str = JSON.stringify(obj);
        socialOptions.data = json_str;
        console.log('socialOptions.data', socialOptions.data);
        $.ajax(socialOptions);
        return false;
      });
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
