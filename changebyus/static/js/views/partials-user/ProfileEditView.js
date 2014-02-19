define(["underscore", "backbone", "jquery", "template", "abstract-view", "serializeObject"], function(_, Backbone, $, temp, AbstractView, serializeObject) {
  var ProfileEditView;
  return ProfileEditView = AbstractView.extend({
    initialize: function(options_) {
      var self;
      AbstractView.prototype.initialize.call(this, options_);
      this.viewData = this.model.attributes;
      self = this;
      this.getSocial();
      return document.windowReload = function() {
        return self.getSocial(false);
      };
    },
    events: {
      "click .social-btns a": "socialClick",
      "click #delete-account": "deleteAccount"
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "partials-user/profile-edit-form.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoaded();
      });
    },
    getSocial: function(render_) {
      var _this = this;
      if (render_ == null) {
        render_ = true;
      }
      return $.get("/api/user/socialstatus", function(response_) {
        var e;
        try {
          _this.viewData.facebook = response_.data.facebook;
          _this.viewData.twitter = response_.data.twitter;
        } catch (_error) {
          e = _error;
        }
        if (render_) {
          return _this.render();
        } else {
          return _this.checkSocial();
        }
      });
    },
    socialClick: function(e) {
      var url;
      e.preventDefault();
      url = $(e.currentTarget).attr("href");
      return popWindow(url);
    },
    checkSocial: function() {
      var $facebook, $twitter;
      $twitter = $('.twitter a');
      $facebook = $('.facebook a');
      if (this.viewData.facebook) {
        $facebook.removeClass('btn-primary').addClass('btn-tertiary').text('Disconnect').attr("href", "/social/facebook/disconnect");
      } else {
        $facebook.addClass('btn-primary').removeClass('btn-tertiary').text('Connect').attr("href", "/social/facebook/link");
      }
      if (this.viewData.twitter) {
        return $twitter.removeClass('btn-primary').addClass('btn-tertiary').text('Disconnect').attr("href", "/social/twitter/disconnect");
      } else {
        return $twitter.addClass('btn-primary').removeClass('btn-tertiary').text('Connect').attr("href", "/social/twitter/link");
      }
    },
    onTemplateLoaded: function() {
      this.ajaxForm();
      $('input[name="visibility"]').change(function() {
        return $('input[name="private"]').attr('checked', $(this).val() === "private");
      });
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    deleteAccount: function(e) {
      var confirmation,
        _this = this;
      e.preventDefault();
      confirmation = confirm("Are you sure you want to delete your account?");
      if (confirmation) {
        e.preventDefault();
        return $.ajax({
          type: "DELETE",
          url: "/api/user/" + this.model.id
        }).done(function(res_) {
          if (res_.success) {
            return window.location.href = "/";
          }
        });
      }
    },
    ajaxForm: function() {
      var $feedback, $form, $inputs, $projectLocation, $submit, options,
        _this = this;
      $('.fileupload').fileupload({
        uploadtype: 'image'
      });
      $submit = this.$el.find("input[type=submit]");
      $form = this.$el.find("form");
      $feedback = $("#feedback");
      $inputs = $form.find("input, textarea");
      options = {
        type: $form.attr('method'),
        url: $form.attr('action'),
        dataType: "json",
        contentType: "multipart/form-data; charset=utf-8",
        beforeSubmit: function(arr_, form_, options_) {
          if ($form.valid()) {
            $inputs.attr("disabled", "disabled");
            return true;
          } else {
            return false;
          }
        },
        success: function(res) {
          var msg;
          msg = res.msg.toLowerCase() === "ok" ? "Updated Successfully" : res.msg;
          $feedback.show().html(msg);
          $inputs.removeAttr("disabled");
          if (res.success) {
            $("html, body").animate({
              scrollTop: 0
            }, "slow");
            return $feedback.addClass('.alert-success').removeClass('.alert-error');
          } else {
            return $feedback.removeClass('.alert-success').addClass('.alert-error');
          }
        }
      };
      $form.ajaxForm(options);
      $projectLocation = $("#location");
      $projectLocation.typeahead({
        template: '<div class="zip">{{ name }} {{ zip }}</div>',
        engine: Hogan,
        valueKey: 'name',
        name: 'zip',
        remote: {
          url: "/api/project/geopoint?s=%QUERY",
          filter: function(resp) {
            var loc, zips, _i, _len, _ref;
            zips = [];
            if (resp.msg.toLowerCase() === "ok" && resp.data.length > 0) {
              _ref = resp.data;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                loc = _ref[_i];
                zips.push({
                  'name': loc.name,
                  'lat': loc.lat,
                  'lon': loc.lon,
                  'zip': loc.zip
                });
              }
            }
            return zips;
          }
        }
      }).bind('typeahead:selected', function(obj, datum) {
        _this.location = datum;
        $('input[name="location"]').val(_this.location.name);
        $('input[name="lat"]').val(_this.location.lat);
        return $('input[name="lon"]').val(_this.location.lon);
      });
      return $('input:radio, input:checkbox').screwDefaultButtons({
        image: 'url("/static/img/black-check.png")',
        width: 18,
        height: 18
      });
    }
  });
});
