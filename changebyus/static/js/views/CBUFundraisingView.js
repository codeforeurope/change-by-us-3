define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel", "model/ProjectModel"], function(_, Backbone, $, temp, AbstractView, UserModel, ProjectModel) {
  var CBUFundraisingView;
  return CBUFundraisingView = AbstractView.extend({
    $review: null,
    stripe: {},
    initialize: function(options) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options);
      this.model = new ProjectModel({
        id: this.model.id
      });
      return this.model.fetch({
        success: function() {
          return _this.onFetch();
        }
      });
    },
    event: {
      "click #edit-goal": "onEditGoalClick"
    },
    onEditGoalClick: function() {
      this.$el.toggle();
      return this.$review.toggle();
    },
    onFetch: function() {
      this.stripe = this.model.get("stripe_account");
      this.stripe.project_id = this.model.id;
      this.stripe.account_id = this.stripe.id;
      return this.render();
    },
    render: function() {
      var _this = this;
      if (this.$el.html() === "") {
        this.$el = $("<div class='body-container'/>");
      }
      this.$el.template(this.templateDir + "/templates/partials-universal/stripe-review.html", {
        data: this.stripe
      }, function() {
        return _this.onTemplateLoad();
      });
      $(this.parent).append(this.$el);
      return this.$el.show();
    },
    onTemplateLoad: function() {
      var _this = this;
      if (this.$review === null) {
        this.$review = $("<div class='body-container'/>");
      }
      this.$review.template(this.templateDir + "/templates/partials-universal/stripe-form.html", {
        data: this.stripe
      }, function() {
        return _this.ajaxForm();
      });
      $(this.parent).append(this.$review);
      this.$review.hide();
      return this.delegateEvents();
    },
    ajaxForm: function() {
      var $form, options,
        _this = this;
      $form = this.$review.find('form');
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
