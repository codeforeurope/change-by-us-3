define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectMemberListItemView;
  return ProjectMemberListItemView = AbstractView.extend({
    tagName: "li",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      $(this.el).template(this.templateDir + "/templates/partials-project/project-member-list-item.html", {
        data: this.model.attributes
      }, function() {
        return _this.onTemplateLoad();
      });
      return this;
    }
  });
});
