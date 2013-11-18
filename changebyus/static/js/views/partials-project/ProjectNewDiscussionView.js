define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectWysiwygFormView"], function(_, Backbone, $, temp, AbstractView, ProjectWysiwygFormView) {
  var ProjectNewDiscussionView;
  return ProjectNewDiscussionView = AbstractView.extend({
    parent: "#project-new-discussion",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-new-discussion.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var form,
        _this = this;
      form = new ProjectWysiwygFormView({
        parent: "#discussion-form"
      });
      return form.success = function(response_) {
        form.resetForm();
        return window.location = "/project/" + _this.model.id + "#discussion/" + response_.data.id;
      };
    }
  });
});
