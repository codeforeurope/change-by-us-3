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
        var form, formDiv;
        formDiv = _this.$el.find("#discussion-form");
        return form = new ProjectWysiwygFormView({
          parent: formDiv
        });
      });
    }
  });
});
