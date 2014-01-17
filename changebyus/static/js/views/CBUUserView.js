define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel", "collection/ProjectListCollection", "resource-project-view"], function(_, Backbone, $, temp, AbstractView, UserModel, ProjectListCollection, ResourceProjectPreviewView) {
  var CBUUserView;
  return CBUUserView = AbstractView.extend({
    joinedProjects: null,
    ownedProjects: null,
    initialize: function(options_) {
      var options,
        _this = this;
      options = options_;
      AbstractView.prototype.initialize.call(this, options);
      this.model = new UserModel(options.model);
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    events: {
      "click .flag-user a": "flagProject"
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='user'/>");
      this.$el.template(this.templateDir + "/templates/partials-user/user.html", {
        data: this.model.attributes
      }, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      if (this.model.id === window.userID) {
        $('.edit').removeClass('invisible');
        $('.flag-user').remove();
      }
      this.loadProjects();
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    loadProjects: function() {
      this.joinedProjects = new ProjectListCollection({
        url: "/api/project/user/" + this.model.id + "/joined-projects"
      });
      this.joinedProjects.on("reset", this.addJoined, this);
      this.joinedProjects.fetch({
        reset: true
      });
      this.ownedProjects = new ProjectListCollection({
        url: "/api/project/user/" + this.model.id + "/owned-projects"
      });
      this.ownedProjects.on("reset", this.addOwned, this);
      return this.ownedProjects.fetch({
        reset: true
      });
    },
    flagUser: function(e) {
      var _this = this;
      e.preventDefault();
      return $.post("/api/user/" + this.model.id + "/flag", function(res_) {
        $('.flag-user').css('opacity', 0.25);
        return console.log(res_);
      });
    },
    addJoined: function() {
      var _this = this;
      return this.joinedProjects.each(function(projectModel) {
        return _this.addOne(projectModel, "#following-list");
      });
    },
    addOwned: function() {
      var _this = this;
      return this.ownedProjects.each(function(projectModel) {
        return _this.addOne(projectModel, "#project-list");
      });
    },
    addOne: function(projectModel_, parent_) {
      var view;
      view = new ResourceProjectPreviewView({
        model: projectModel_
      });
      view.render();
      return this.$el.find(parent_).append(view.$el);
    }
  });
});
