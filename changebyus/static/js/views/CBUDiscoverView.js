define(["underscore", "backbone", "jquery", "template", "views/partials-discover/BannerSearchView", "views/partials-project/ProjectPartialsView", "collection/ProjectListCollection"], function(_, Backbone, $, temp, BannerSearchView, ProjectPartialsView, ProjectListCollection) {
  var CBUDiscoverView;
  return CBUDiscoverView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
    viewData: {},
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
        var bannerSearchView, searchParent;
        $(_this.parent).append(_this.$el);
        searchParent = _this.$el.find(".content");
        bannerSearchView = new BannerSearchView({
          parent: searchParent
        });
        _this.collection.on("reset", _this.addAll, _this);
        return _this.collection.fetch({
          reset: true
        });
      });
    },
    addOne: function(projectModel) {
      var view;
      view = new ProjectPartialsView({
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
