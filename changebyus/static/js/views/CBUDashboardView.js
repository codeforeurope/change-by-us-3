define(["underscore", "backbone", "jquery", "template", "abstract-view", "collection/ProjectListCollection", "model/UserModel", "views/partials-project/ProjectPartialsView"], function(_, Backbone, $, temp, AbstractView, ProjectListCollection, UserModel, ProjectPartialsView) {
  var CBUDashboardView;
  return CBUDashboardView = AbstractView.extend({
    initialize: function(options) {
      var _this = this;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      this.userModel = new UserModel({
        id: this.model.id
      });
      return this.userModel.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    render: function() {
      var _this = this;
      console.log('@userModel', this.userModel);
      this.$el.template(this.templateDir + "/templates/dashboard.html", {
        data: this.userModel.attributes
      }, function() {
        _this.onTemplateLoad();
        return _this.loadProjects();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      /*
      				id = @model.get("id")
      				config = {id:id}
      				projectUpdatesCollection  = new ProjectUpdatesCollection(config)
      				projectMembersCollection  = new ProjectMembersCollection(config)
      				projectCalendarCollection = new ProjectCalendarCollection(config)
      */

      var hash,
        _this = this;
      this.manageView = $('#manage-projects');
      this.followView = $('#follow-projects');
      this.profileView = $('#edit-profile');
      this.manageBTN = $("a[href='#manage']").parent();
      this.followBTN = $("a[href='#follow']").parent();
      this.profileBTN = $("a[href='#profile']").parent();
      hash = window.location.hash.substring(1);
      this.toggleSubView((hash === "" ? "updates" : hash));
      $(window).bind("hashchange", function(e) {
        hash = window.location.hash.substring(1);
        return _this.toggleSubView(hash);
      });
      return $("a[href^='#']").click(function(e) {
        return window.location.hash = $(this).attr("href").substring(1);
      });
    },
    toggleSubView: function(view) {
      var btn, v, _i, _j, _len, _len1, _ref, _ref1;
      _ref = [this.manageView, this.profileView, this.followView];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.hide();
      }
      _ref1 = [this.followBTN, this.profileBTN, this.manageBTN];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        btn = _ref1[_j];
        btn.removeClass("active");
      }
      switch (view) {
        case "follow":
          this.followView.show();
          return this.followBTN.addClass("active");
        case "profile":
          this.profileView.show();
          return this.profileBTN.addClass("active");
        default:
          this.manageView.show();
          return this.manageBTN.addClass("active");
      }
    },
    loadProjects: function() {
      console.log('onTemplateLoad');
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
        return _this.addOne(projectModel, _this.followView.find("ul"));
      });
    },
    addOwned: function() {
      var _this = this;
      return this.ownedProjects.each(function(projectModel) {
        return _this.addOne(projectModel, _this.manageView.find("ul"));
      });
    },
    addOne: function(projectModel_, parent_) {
      var view;
      view = new ProjectPartialsView({
        model: projectModel_
      });
      return this.$el.find(parent_).append(view.$el);
    }
  });
});
