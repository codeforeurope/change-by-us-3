define(["underscore", "backbone", "jquery", "template", "moment", "abstract-view", "model/ProjectPostReplyModel"], function(_, Backbone, $, temp, moment, AbstractView, ProjectPostReplyModel) {
  var ProjectPostReplyView;
  return ProjectPostReplyView = AbstractView.extend({
    model: null,
    tagName: "li",
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      this.model = new ProjectPostReplyModel({
        id: options.id
      });
      return this.render();
    },
    render: function() {
      var $reply,
        _this = this;
      $reply = $("<div class='post-reply clearfix'/>");
      $reply.template(this.templateDir + "/templates/partials-project/project-post-reply-view.html", {
        data: {}
      }, function() {});
      return $(this.el).append($reply);
    }
  });
});
