define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectSubView", "views/partials-universal/WysiwygFormView", "views/partials-universal/UpdateListItemView", "views/partials-project/ProjectUpdateSuccessModalView"], function(_, Backbone, $, temp, AbstractView, ProjectSubView, WysiwygFormView, UpdateListItemView, ProjectUpdateSuccessModalView) {
  var ProjectAddUpdateView;
  return ProjectAddUpdateView = ProjectSubView.extend({
    parent: "#project-update",
    events: {
      "click #post-update": "animateUp",
      "click .share-toggle": "shareToggle",
      "click .share-options .styledCheckbox": "shareOption"
    },
    render: function() {
      var self,
        _this = this;
      this.$el = $(this.parent);
      this.viewData.image_url_round_small = $('.profile-nav-header img').attr('src');
      this.$el.template(this.templateDir + "partials-project/project-add-update.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      self = this;
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
          $feedback.show();
          return console.log('error response_', error_);
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
        if (forceClick_) {
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
        if (forceClick_) {
          this.$twitter.screwDefaultButtons("check");
        }
        return this.$twitterLabel.removeClass("disabled-btn").unbind("click");
      }
    },
    addAll: function() {
      var _this = this;
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "partials-universal/entries-day-wrapper.html", {}, function() {
        return _this.onDayWrapperLoad();
      });
    },
    onDayWrapperLoad: function() {
      var m, model_;
      if (this.collection.length > 0) {
        model_ = this.collection.models[0];
        m = moment(model_.get("created_at")).format("MMMM D");
        this.newDay(m);
      }
      this.isDataLoaded = true;
      ProjectSubView.prototype.addAll.call(this);
      return onPageElementsLoad();
    },
    newDay: function(date_) {
      this.currentDate = date_;
      this.$currentDay = this.$day.clone();
      this.$el.append(this.$currentDay);
      this.$currentDay.find('h4').html(date_);
      return this.$ul = this.$currentDay.find('.bordered-item');
    },
    addOne: function(model_) {
      var m, view;
      m = moment(model_.get("created_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      view = new UpdateListItemView({
        model: model_
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
    animateUp: function() {
      return $("html, body").animate({
        scrollTop: 0
      }, "slow");
    },
    socialClick: function(site_) {
      return popWindow("/social/" + site_ + "/link");
    }
  });
});
