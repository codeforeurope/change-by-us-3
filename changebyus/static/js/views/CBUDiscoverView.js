define(["underscore", "backbone", "jquery", "template", "views/partials-discover/BannerSearchView", "resource-project-view", "collection/ProjectListCollection", "abstract-view"], function(_, Backbone, $, temp, BannerSearchView, ResourceProjectPreviewView, ProjectListCollection, AbstractView) {
  var CBUDiscoverView;
  return CBUDiscoverView = AbstractView.extend({
    bannerSearchView: null,
    initialize: function(options) {
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      this.collection = options.collection || new ProjectListCollection();
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='discover'/>");
      return this.$el.template(this.templateDir + "/templates/discover.html", {
        data: this.viewData
      }, function() {
        return onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var bannerSearchView, searchParent;
      $(this.parent).append(this.$el);
      searchParent = this.$el.find(".content");
      bannerSearchView = new BannerSearchView({
        parent: searchParent
      });
      this.collection.on("reset", this.addAll, this);
      return this.collection.fetch({
        reset: true
      });
    },
    addOne: function(projectModel) {
      var view;
      view = new ResourceProjectPreviewView({
        model: projectModel
      });
      return this.$el.find("#project-list").append(view.el);
    },
    addAll: function() {
      var _this = this;
      this.collection.each(function(projectModel) {
        return _this.addOne(projectModel);
      });
      if (this.collection.length === 0) {
        return this.$el.template(this.templateDir + "/templates/partials-discover/no-results.html", {
          data: this.viewData
        }, function() {});
      }
    }
  });
});
