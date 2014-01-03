define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel", "model/ProjectModel"], function(_, Backbone, $, temp, AbstractView, UserModel, ProjectModel) {
  var CBUFundraisingView;
  return CBUFundraisingView = AbstractView.extend({
    initialize: function(options) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options);
      this.model = new ProjectModel({
        id: this.model.id
      });
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='content-wrapper clearfix'/>");
      this.$el.template(this.templateDir + "/templates/partials-universal/stripe-review.html", {
        data: this.model.get("stripe_account")
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var $form, options,
        _this = this;
      $form = this.$el.find('form');
      options = {
        success: function(response_) {
          return _this.onSuccess(response_.data);
        }
      };
      return $form.ajaxForm(options);
    }
  });
});
