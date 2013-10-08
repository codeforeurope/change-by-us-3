define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectPostReplyModel"], function(_, Backbone, $, temp, moment, AbstractView, ProjectPostReplyModel) {
  var ProjectPostReplyView;
  return ProjectPostReplyView = AbstractView.extend({
    model: null,
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      this.model = new ProjectPostReplyModel({
        id: options.id
      });
      return this.render();
    },
    render: function() {
      this.$el = $("<div class='post-reply'/>");
      return this.$el.template(this.templateDir + "/templates/partials-project/project-post-reply-view.html", {
        data: {}
      }, function() {});
    }
  });
});
