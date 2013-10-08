define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectDiscussionCommentView;
  return ProjectDiscussionCommentView = AbstractView.extend({
    parent: "#project",
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-discussion-comment.html", {
        data: this.viewData
      }, function() {});
      return $(this.parent).append(this.$el);
    }
  });
});
