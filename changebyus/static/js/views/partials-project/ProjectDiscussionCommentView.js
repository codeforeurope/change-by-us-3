define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectDiscussionCommentView;
  return ProjectDiscussionCommentView = AbstractView.extend({
    parent: "#project",
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "partials-project/project-discussion-comment.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    }
  });
});
