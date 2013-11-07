define(["underscore", "backbone", "jquery", "template", "form", "views/partials-project/ProjectPartialsView", "views/partials-homepage/BannerImageView", "collection/ProjectListCollection"], function(_, Backbone, $, temp, form, ProjectPartialsView, BannerImageView, ProjectListCollection) {
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
      var self;
      self = this;
      this.$el = $("<div class='projects-main'/>");
      return this.$el.template(this.templateDir + "/templates/main.html", {}, function() {
        var bannerImageView, bannerParent;
        $(self.parent).prepend(self.$el);
        bannerParent = self.$el.find(".body-container-wide");
        bannerImageView = new BannerImageView({
          parent: bannerParent
        });
        self.collection.on("reset", self.addAll, self);
        self.collection.fetch({
          reset: true
        });
        return self.ajaxForm();
      });
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
      var i,
        _this = this;
      i = 0;
      return this.collection.each(function(projectModel) {
        return _this.addOne(projectModel);
      });
    },
    addOne: function(projectModel) {
      var view;
      view = new ProjectPartialsView({
        model: projectModel
      });
      return this.$el.find("#project-list").append(view.$el);
    }
  });
});
