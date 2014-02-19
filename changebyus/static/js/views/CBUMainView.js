define(["underscore", "backbone", "jquery", "template", "form", "resource-project-view", "views/partials-homepage/BannerImageView", "collection/ProjectListCollection", "collection/ResourceListCollection", "abstract-view"], function(_, Backbone, $, temp, form, ResourceProjectPreviewView, BannerImageView, ProjectListCollection, ResourceListCollection, AbstractView) {
  var CBUMainView;
  return CBUMainView = AbstractView.extend({
    initialize: function(options_) {
      var options;
      options = options_;
      AbstractView.prototype.initialize.call(this, options);
      this.collection = options.collection || new ProjectListCollection();
      this.resourceCollection = options.resourceCollection || new ResourceListCollection();
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='projects-main'/>");
      return this.$el.template(this.templateDir + "main.html", {}, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var bannerImageView, bannerParent;
      $(this.parent).prepend(this.$el);
      bannerParent = this.$el.find(".body-container-wide");
      bannerImageView = new BannerImageView({
        parent: bannerParent
      });
      this.collection.on("reset", this.addAll, this);
      this.collection.fetch({
        reset: true
      });
      this.resourceCollection.on("reset", this.addAllResources, this);
      this.resourceCollection.fetch({
        reset: true
      });
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    addAll: function() {
      var _this = this;
      this.collection.each(function(projectModel_) {
        return _this.addProject(projectModel_);
      });
      return onPageElementsLoad();
    },
    addProject: function(projectModel_) {
      var view;
      view = new ResourceProjectPreviewView({
        model: projectModel_
      });
      view.render();
      return this.$el.find("#project-list").append(view.$el);
    },
    addAllResources: function() {
      var _this = this;
      this.resourceCollection.each(function(projectModel_) {
        return _this.addResource(projectModel_);
      });
      return onPageElementsLoad();
    },
    addResource: function(projectModel_) {
      var view;
      view = new ResourceProjectPreviewView({
        model: projectModel_
      });
      view.render();
      return this.$el.find("#resource-list").append(view.$el);
    }
  });
});
