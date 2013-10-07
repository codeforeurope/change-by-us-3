define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectUpdateListItemView;
  return ProjectUpdateListItemView = AbstractView.extend({
    tagName: "li",
    render: function() {
      $(this.el).template(this.templateDir + "/templates/partials-project/project-update-list-item.html", {
        data: this.model.attributes
      }, function() {});
      return this;
    }
  });
});
