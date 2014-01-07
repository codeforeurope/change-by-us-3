define(["underscore", "backbone", "jquery", "template", "resource-project-view", "collection/FlaggedProjectCollection", "abstract-view"], function(_, Backbone, $, temp, ResourceProjectPreviewView, FlaggedProjectCollection, AbstractView) {
  var CBUAdminView;
  return CBUAdminView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.collection = options.collection || new FlaggedProjectCollection();
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='discover'/>");
      this.$el.template(this.templateDir + "/templates/admin.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      this.collection.on("reset", this.addAll, this);
      return this.collection.fetch({
        reset: true
      });
    },
    addAll: function() {
      var _this = this;
      return this.collection.each(function(projectModel_) {
        return _this.addOne(projectModel_);
      });
    },
    addOne: function(projectModel_) {
      var view;
      view = new ResourceProjectPreviewView({
        model: projectModel_
      });
      view.render();
      return this.$el.find("#project-list").append(view.el);
    }
  });
});
