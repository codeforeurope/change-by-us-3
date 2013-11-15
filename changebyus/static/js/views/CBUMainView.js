define(["underscore", "backbone", "jquery", "template", "form", "resource-project-view", "views/partials-homepage/BannerImageView", "collection/ProjectListCollection"], function(_, Backbone, $, temp, form, ResourceProjectPreviewView, BannerImageView, ProjectListCollection) {
  var CBUMainView;
  return CBUMainView = Backbone.View.extend({
    parent: "body",
    templateDir: "/static",
    viewData: {},
    collection: {},
    initialize: function(options) {
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      this.collection = options.collection || new ProjectListCollection();
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='projects-main'/>");
      return this.$el.template(this.templateDir + "/templates/main.html", {}, function() {
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
      onPageElementsLoad();
      return this.ajaxForm();
    },
    ajaxForm: function() {
      var $signin, $signup;
      $signup = $("form[name=signup]");
      $signup.ajaxForm(function(response) {
        return console.log(response);
      });
      $signin = $("form[name=signin]");
      return $signin.ajaxForm(function(response) {
        return console.log(response);
      });
    },
    addAll: function() {
      var _this = this;
      return this.collection.each(function(projectModel) {
        return _this.addOne(projectModel);
      });
    },
    addOne: function(projectModel) {
      var view;
      view = new ResourceProjectPreviewView({
        model: projectModel
      });
      return this.$el.find("#project-list").append(view.$el);
    }
  });
});
