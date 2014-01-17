define(["underscore", "backbone", "jquery", "template", "views/partials-discover/BannerSearchView", "resource-project-view", "collection/ProjectListCollection", "abstract-view"], function(_, Backbone, $, temp, BannerSearchView, ResourceProjectPreviewView, ProjectListCollection, AbstractView) {
  var CBUDiscoverView;
  return CBUDiscoverView = AbstractView.extend({
    initialize: function(options_) {
      var options;
      options = options_;
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
      var searchParent,
        _this = this;
      $(this.parent).append(this.$el);
      searchParent = this.$el.find(".content");
      this.bannerSearchView = new BannerSearchView({
        parent: searchParent
      });
      this.bannerSearchView.on("ON_RESULTS", function(s) {
        return _this.onResults(s);
      });
      this.collection.on("reset", this.addAll, this);
      this.collection.fetch({
        reset: true
      });
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    /* EVENTS ---------------------------------------------*/

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
    onResults: function(size_) {
      var _this = this;
      if (size_ > 0) {
        return this.$el.find("#no-result").hide();
      } else {
        return this.$el.find("#no-result").show().template(this.templateDir + "/templates/partials-discover/no-results.html", {
          data: {}
        }, function() {});
      }
    }
  });
});
