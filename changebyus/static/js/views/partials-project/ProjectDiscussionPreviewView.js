define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectDiscussionPreviewView;
  return ProjectDiscussionPreviewView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.apply(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='project'/>");
      this.$el.template(this.templateDir + "/templates/partials-project/project-discussion-preview.html", {
        data: this.viewData
      }, function() {
        return _this.ajaxForm();
      });
      return $(this.parent).append(this.$el);
    }
  });
});
