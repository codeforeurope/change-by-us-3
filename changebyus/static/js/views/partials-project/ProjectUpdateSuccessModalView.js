define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectWysiwygFormView"], function(_, Backbone, $, temp, AbstractView, ProjectWysiwygFormView) {
  var ProjectUpdateSuccessModalView;
  return ProjectUpdateSuccessModalView = AbstractView.extend({
    parent: "body",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='modal-fullscreen dark'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-share-success-overlay.html", {
        data: this.model
      }, function() {});
      return $(this.parent).append(this.$el);
    }
  });
});
