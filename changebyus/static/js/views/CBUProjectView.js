define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-universal/UpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/UpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, UpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, UpdatesCollection) {
  var CBUProjectView;
  return CBUProjectView = AbstractView.extend({
    isOwner: false,
    isMember: false,
    isResource: false,
    projectCalenderView: null,
    projectMembersView: null,
    updatesView: null,
    updatesBTN: null,
    membersBTN: null,
    calendarBTN: null,
    memberData: null,
    $header: null,
    initialize: function(options) {
      var _this = this;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.model = new ProjectModel(options.model);
      this.collection = options.collection || this.collection;
      this.isOwner = options.isOwner || this.isOwner;
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    events: {
      "click .flag-project a": "flagProject",
      "click .project-footer .btn": "joinProject",
      "click  a[href^='#']": "changeHash"
    },
    render: function() {
      var className, templateURL,
        _this = this;
      this.isResource = this.model.get("resource");
      if (this.isResource) {
        className = "resource-container";
        templateURL = "/templates/resource.html";
      } else {
        className = "project-container";
        templateURL = "/templates/project.html";
      }
      this.$el = $("<div class='" + className + "'/>");
      this.$el.template(this.templateDir + templateURL, {}, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var id,
        _this = this;
      this.viewData = this.model.attributes;
      if (window.userID === "") {
        this.isMember = false;
        return this.addHeaderView();
      } else {
        id = this.model.get("id");
        return $.ajax({
          type: "GET",
          url: "/api/project/" + id + "/user/" + window.userID
        }).done(function(response) {
          if (response.success) {
            _this.memberData = response.data;
            _this.isMember = true === _this.memberData.member || true === _this.memberData.organizer || true === _this.memberData.owner ? true : false;
            _this.viewData.isMember = _this.isMember;
            return _this.addHeaderView();
          }
        });
      }
    },
    addHeaderView: function() {
      var _this = this;
      console.log('isResource', this.isResource);
      if (this.isResource) {
        this.$header = $("<div class='resource-header'/>");
        return this.$header.template(this.templateDir + "/templates/partials-resource/resource-header.html", {
          data: this.viewData
        }, function() {
          return _this.onHeaderLoaded();
        });
      } else {
        this.$header = $("<div class='project-header'/>");
        return this.$header.template(this.templateDir + "/templates/partials-project/project-header.html", {
          data: this.viewData
        }, function() {
          return _this.onHeaderLoaded();
        });
      }
    },
    onHeaderLoaded: function() {
      var config, id;
      console.log('@model', this.model);
      id = this.model.get("id");
      config = {
        id: id
      };
      this.$el.prepend(this.$header);
      this.updatesCollection = new UpdatesCollection(config);
      this.projectMembersCollection = new ProjectMembersCollection(config);
      this.projectMembersCollection.on("reset", this.onCollectionLoad, this);
      return this.projectMembersCollection.fetch({
        reset: true
      });
    },
    onCollectionLoad: function() {
      var parent,
        _this = this;
      parent = this.isResource ? "#resource-updates" : "#project-updates";
      this.updatesView = new UpdatesView({
        collection: this.updatesCollection,
        members: this.projectMembersCollection,
        isMember: this.isMember,
        isResource: this.isResource,
        parent: parent
      });
      console.log('parent', parent);
      if (this.model.get("resource")) {
        this.updatesView.show();
      } else {
        this.projectMembersView = new ProjectMembersView({
          collection: this.projectMembersCollection,
          isDataLoaded: true,
          isMember: this.isMember
        });
        this.projectCalenderView = new ProjectCalenderView({
          model: this.model,
          isMember: this.isMember,
          isOwner: this.isOwner
        });
        this.updatesBTN = $("a[href='#updates']").parent();
        this.membersBTN = $("a[href='#members']").parent();
        this.calendarBTN = $("a[href='#calendar']").parent();
        $(window).bind("hashchange", function(e) {
          return _this.toggleSubView();
        });
        this.toggleSubView();
      }
      return this.delegateEvents();
    },
    flagProject: function(e) {
      var $this, url,
        _this = this;
      e.preventDefault();
      $this = $(e.currentTarget);
      $this.parent().css('opacity', 0.25);
      url = $this.attr('href');
      return $.ajax({
        type: "POST",
        url: url
      }).done(function(response_) {
        return console.log(response_);
      });
    },
    joinProject: function(e) {
      var $join, id,
        _this = this;
      if (this.isMember) {
        return;
      }
      if (window.userID === "") {
        return window.location = "/login";
      } else {
        id = this.model.get("id");
        $join = $(".project-footer .btn");
        e.preventDefault();
        return $.ajax({
          type: "POST",
          url: "/api/project/join",
          data: {
            project_id: id
          }
        }).done(function(response) {
          if (response.success) {
            _this.isMember = true;
            return $join.html('Joined!').css('background-color', '#e6e6e6');
          }
        });
      }
    },
    toggleSubView: function() {
      var btn, v, view, _i, _j, _len, _len1, _ref, _ref1;
      view = window.location.hash.substring(1);
      _ref = [this.updatesView, this.projectMembersView, this.projectCalenderView];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.hide();
      }
      _ref1 = [this.updatesBTN, this.membersBTN, this.calendarBTN];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        btn = _ref1[_j];
        btn.removeClass("active");
      }
      switch (view) {
        case "members":
          this.projectMembersView.show();
          return this.membersBTN.addClass("active");
        case "calendar":
          this.projectCalenderView.show();
          return this.calendarBTN.addClass("active");
        default:
          this.updatesView.show();
          return this.updatesBTN.addClass("active");
      }
    }
  });
});
