define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectMemberListItemView;
  return ProjectMemberListItemView = AbstractView.extend({
    tagName: "li",
    view: "public",
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.view = options.view || this.view;
      this.viewData = this.model.attributes;
      this.viewData.view = this.view;
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.el);
      this.$el.template(this.templateDir + "/templates/partials-project/project-member-list-item.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return this;
    },
    onTemplateLoad: function() {
      var $dk;
      if (this.view === "admin") {
        return $dk = $("#" + this.model.id).dropkick();
      }
    }
  });
});
