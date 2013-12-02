define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/UserModel", "collection/ProjectListCollection", "resource-project-view"], function(_, Backbone, $, temp, AbstractView, UserModel, ProjectListCollection, ResourceProjectPreviewView) {
  var CBUUserView;
  return CBUUserView = AbstractView.extend({
    joinedProjects: null,
    ownedProjects: null,
    initialize: function(options) {
      var _this = this;
      AbstractView.prototype.initialize.call(this, options);
      this.model = new UserModel(options.model);
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
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
      }
      this.ajaxForm();
      return this.loadProjects();
    },
    ajaxForm: function() {
      var $signin;
      $signin = $("form[name=signin]");
      return $signin.ajaxForm(function(response) {
        return console.log(response);
      });
    },
    loadProjects: function() {
      this.joinedProjects = new ProjectListCollection({
        url: "/api/project/user/" + this.model.id + "/joinedprojects"
      });
      this.joinedProjects.on("reset", this.addJoined, this);
      this.joinedProjects.fetch({
        reset: true
      });
      this.ownedProjects = new ProjectListCollection({
        url: "/api/project/user/" + this.model.id + "/ownedprojects"
      });
      this.ownedProjects.on("reset", this.addOwned, this);
      return this.ownedProjects.fetch({
        reset: true
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
      return this.$el.find(parent_).append(view.$el);
    }
  });
});
