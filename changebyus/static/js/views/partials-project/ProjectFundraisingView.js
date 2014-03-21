define(["underscore", "backbone", "jquery", "template", "form", "abstract-view"], function(_, Backbone, $, temp, form, AbstractView) {
  var ProjectFundraisingView;
  return ProjectFundraisingView = AbstractView.extend({
    parent: "#project-fundraising",
    reviewDiv: "#review-fundraising",
    setupDiv: "#setup-fundraising",
    name: "My Project",
    initialize: function(options_) {
      var options;
      options = options_;
      AbstractView.prototype.initialize.call(this, options);
      this.name = options.name || this.name;
      return this.render();
    },
    events: {
      "click #get-started": "linkStripe",
      "click #does-it-work": "slideToggle",
      "click #edit-goal": "onEditGoalClick"
    },
    render: function() {
      var _this = this;
      this.$el = $(this.reviewDiv);
      this.stripe = this.model.get("stripe_account");
      if (this.stripe) {
        return this.$el.template(this.templateDir + "partials-universal/stripe-review.html", {
          data: this.stripe
        }, function() {
          return _this.onTemplateLoad();
        });
      } else {
        return this.$el.template(this.templateDir + "partials-project/project-fundraising-get-started.html", {}, function() {
          return _this.getStarted();
        });
      }
    },
    onTemplateLoad: function() {
      var _this = this;
      this.$setup = $(this.setupDiv);
      this.$setup.template(this.templateDir + "partials-universal/stripe-form.html", {
        data: this.stripe
      }, function() {
        return _this.ajaxForm();
      });
      this.$setup.hide();
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    getStarted: function() {
      this.delegateEvents();
      this.$how = $('.fundraising-left .content-wrapper');
      return this.$how.slideToggle(1);
    },
    linkStripe: function(e) {
      var dataObj,
        _this = this;
      e.preventDefault();
      dataObj = {
        project_id: this.id,
        project_name: this.name
      };
      return $.ajax({
        type: "POST",
        url: "/stripe/link",
        data: JSON.stringify(dataObj),
        dataType: "text",
        contentType: "application/json; charset=utf-8"
      }).done(function(response_) {
        return popWindow(response_);
      });
    },
    onEditGoalClick: function(e) {
      this.$el.toggle();
      return this.$setup.toggle();
    },
    slideToggle: function() {
      return this.$how.slideToggle();
    },
    ajaxForm: function() {
      var $form, options,
        _this = this;
      console.log('ajaxForm');
      $form = this.$el.find('form');
      options = {
        success: function(response_) {
          if (response_.success) {
            _this.stripe.description = response_.data.description;
            _this.stripe.goal = response_.data.funding;
            return _this.render();
          }
        }
      };
      return $form.ajaxForm(options);
    }
  });
});
