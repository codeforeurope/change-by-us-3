define(["underscore", "backbone", "jquery", "template", "views/partials-discover/BannerSearchView", "resource-project-view", "collection/ProjectListCollection", "abstract-view"], function(_, Backbone, $, temp, BannerSearchView, ResourceProjectPreviewView, ProjectListCollection, AbstractView) {
  var CBUDiscoverView;
  return CBUDiscoverView = AbstractView.extend({
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.collection = options.collection || new ProjectListCollection();
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='discover'/>");
      return this.$el.template(this.templateDir + "/templates/discover.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var searchParent;
      $(this.parent).append(this.$el);
      searchParent = this.$el.find(".content");
      this.bannerSearchView = new BannerSearchView({
        parent: searchParent
      });
      this.collection.on("reset", this.addAll, this);
      return this.collection.fetch({
        reset: true
      });
    },
    updatePage: function() {
      return this.bannerSearchView.updatePage();
    },
    nextPage: function(e) {
      return this.bannerSearchView.nextPage(e);
    },
    prevClick: function(e) {
      return this.bannerSearchView.prevClick(e);
    },
    pageClick: function(e) {
      return this.bannerSearchView.pageClick(e);
    },
    checkArrows: function() {
      return this.bannerSearchView.checkArrows();
    },
    addAll: function() {
      var _this = this;
      this.collection.each(function(projectModel_) {
        return _this.addOne(projectModel_);
      });
      if (this.collection.length === 0) {
        return this.$el.template(this.templateDir + "/templates/partials-discover/no-results.html", {
          data: this.viewData
        }, function() {});
      }
    },
    addOne: function(projectModel_) {
      var view;
      view = new ResourceProjectPreviewView({
        model: projectModel_
      });
      view.render();
      return this.$el.find("#project-list").append(view.$el);
    }
  });
});
