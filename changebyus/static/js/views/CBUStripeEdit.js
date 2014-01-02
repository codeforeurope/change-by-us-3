define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel", "model/ProjectModel"], function(_, Backbone, $, temp, AbstractView, UserModel, ProjectModel) {
  var CBUStripeEdit;
  return CBUStripeEdit = AbstractView.extend({
    initialize: function(options) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options);
      this.user = new UserModel({
        id: this.model.sid
      });
      return this.user.fetch({
        success: function() {
          return _this.getProject();
        }
      });
    },
    getProject: function() {
      var _this = this;
      this.project = new ProjectModel({
        id: this.model.id
      });
      return this.project.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='user'/>");
      this.$el.template(this.templateDir + "/templates/partials-universal/stripe-form.html", {
        data: {
          account_id: this.user.id,
          project_id: this.project.id,
          name: this.project.get("name")
        }
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
    },
    onSuccess: function(data_) {
      var _this = this;
      this.$el.html("");
      return this.$el.template(this.templateDir + "/templates/partials-universal/stripe-review.html", {
        data: data_
      }, function() {});
    }
  });
});
