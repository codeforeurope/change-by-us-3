define(["underscore", "backbone", "jquery", "template", "abstract-view", "project-sub-view", "views/partials-universal/WysiwygFormView", "views/partials-universal/UpdateListItemView", "views/partials-project/ProjectUpdateSuccessModalView"], function(_, Backbone, $, temp, AbstractView, ProjectSubView, WysiwygFormView, UpdateListItemView, ProjectUpdateSuccessModalView) {
  var ProjectAddUpdateView;
  return ProjectAddUpdateView = ProjectSubView.extend({
    parent: "#project-update",
    linkingSite: "",
    events: {
      "click #post-update": "animateUp",
      "click .share-toggle": "shareToggle",
      "click .share-options .styledCheckbox": "shareOption"
    },
    render: function() {
      var self,
        _this = this;
      console.log(this);
      self = this;
      this.viewData.image_url_round_small = $('.profile-nav-header img').attr('src');
      this.viewData.slug = this.model.get('slug');
      this.$el = $(this.parent);
      this.$el.template(this.templateDir + "partials-project/project-add-update.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return document.windowReload = function() {
        return self.getSocial(false);
      };
    },
    onTemplateLoad: function() {
      this.$ul = this.$el.find('.updates-container ul');
      this.getSocial();
      return ProjectSubView.prototype.onTemplateLoad.call(this);
    },
    getSocial: function(addForm_) {
      var _this = this;
      if (addForm_ == null) {
        addForm_ = true;
      }
      return $.get("/api/user/socialinfo", function(response_) {
        var e;
        try {
          _this.socialInfo = response_.data;
          if (addForm_) {
            return _this.addForm();
          } else {
            return _this.checkSocial(true);
          }
        } catch (_error) {
          e = _error;
          return console.log('getSocial ERROR:', e);
        }
      });
    },
    shareToggle: function() {
      return $(".share-options").toggleClass("hide");
    },
    shareOption: function(e) {
      var checked;
      checked = [];
      $.each($('.share-options input'), function() {
        var $this, id;
        $this = $(this);
        id = $this.attr('id');
        if ($this.is(':checked')) {
          return checked.push(id);
        }
      });
      return $('#social_sharing').val(checked.join());
    },
    addForm: function() {
      var form,
        _this = this;
      form = new WysiwygFormView({
        parent: "#update-form"
      });
      return form.on('ON_TEMPLATE_LOAD', function() {
        var $feedback, $inputs, $submit;
        $feedback = $("#feedback").hide();
        $submit = form.$el.find('input[type="submit"]');
        $inputs = $submit.find("input, textarea");
        _this.$facebook = $("#facebook");
        _this.$twitter = $("#twitter");
        _this.$facebookLabel = $("label[for=facebook]");
        _this.$twitterLabel = $("label[for=twitter]");
        form.beforeSubmit = function(arr_, form_, options_) {
          $feedback.hide();
          return $inputs.attr("disabled", "disabled");
        };
        form.success = function(response_) {
          if (response_.success) {
            _this.addModal(response_.data);
          }
          form.resetForm();
          $("#editor").html("");
          return $inputs.removeAttr("disabled");
        };
        form.error = function(error_) {
          return $feedback.show();
        };
        _this.$el.find('input:radio, input:checkbox').screwDefaultButtons({
          image: 'url("/static/img/black-check.png")',
          width: 18,
          height: 18
        });
        _this.checkSocial();
        return _this.delegateEvents();
      });
    },
    checkSocial: function(forceClick_) {
      var _this = this;
      if (forceClick_ == null) {
        forceClick_ = false;
      }
      if (this.socialInfo.fb_name === "") {
        this.$facebook.screwDefaultButtons("disable");
        this.$facebook.parent().click(function() {
          return _this.socialClick("facebook");
        });
        this.$facebookLabel.addClass("disabled-btn").click(function() {
          return _this.socialClick("facebook");
        });
      } else {
        this.$facebook.screwDefaultButtons("enable");
        if (forceClick_ && this.linkingSite === "facebook") {
          this.$facebook.screwDefaultButtons("check");
        }
        this.$facebookLabel.removeClass("disabled-btn").unbind("click");
      }
      if (this.socialInfo.twitter_name === "") {
        this.$twitter.screwDefaultButtons("disable");
        this.$twitter.parent().click(function() {
          return _this.socialClick("twitter");
        });
        return this.$twitterLabel.addClass("disabled-btn").click(function() {
          return _this.socialClick("twitter");
        });
      } else {
        this.$twitter.screwDefaultButtons("enable");
        if (forceClick_ && this.linkingSite === "twitter") {
          this.$twitter.screwDefaultButtons("check");
        }
        return this.$twitterLabel.removeClass("disabled-btn").unbind("click");
      }
    },
    animateUp: function() {
      return $("html, body").animate({
        scrollTop: 0
      }, "slow");
    },
    socialClick: function(site_) {
      this.linkingSite = site_;
      return popWindow("/social/" + site_ + "/link");
    },
    addAll: function() {
      var _this = this;
      $('.entries-day-wrapper').remove();
      this.$day = $('<div class="entries-day-wrapper"/>');
      return this.$day.template(this.templateDir + "partials-universal/entries-day-wrapper.html", {}, function() {
        return _this.onDayWrapperLoad();
      });
    },
    onDayWrapperLoad: function() {
      ProjectSubView.prototype.onDayWrapperLoad.call(this);
      ProjectSubView.prototype.addAll.call(this);
      return onPageElementsLoad();
    },
    addOne: function(model_) {
      var m, view;
      m = moment(model_.get("created_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      view = new UpdateListItemView({
        model: model_,
        isAdmin: true
      });
      return this.$ul.append(view.$el);
    },
    addModal: function(data_) {
      var modal;
      data_.twitter_name = this.socialInfo.twitter_name;
      data_.slug = this.model.get("slug");
      return modal = new ProjectUpdateSuccessModalView({
        model: data_
      });
    },
    onCollectionLoad: function() {
      var _this = this;
      ProjectSubView.prototype.onCollectionLoad.call(this);
      console.log('onCollectionLoad');
      console.log('onCollectionLoad', this.collection);
      return this.collection.on('remove', function(obj_) {
        _this.addAll();
        return _this.deleteUpdate(obj_.id);
      });
    },
    deleteUpdate: function(id_) {
      var $feedback,
        _this = this;
      $feedback = $("#discussions-feedback");
      return $.ajax({
        type: "POST",
        url: "/api/post/delete",
        data: {
          post_id: id_
        }
      }).done(function(res_) {
        if (res_.success) {
          return $feedback.hide();
        } else {
          return $feedback.show().html(res_.msg);
        }
      });
    }
  });
});
