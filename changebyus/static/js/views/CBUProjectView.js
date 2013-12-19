define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-universal/UpdatesView", "views/partials-universal/WysiwygFormView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/UpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, UpdatesView, WysiwygFormView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, UpdatesCollection) {
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
      this.isResource = options.isResource || this.isResource;
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
      var className, templateURL,
        _this = this;
      if (this.isResource) {
        className = "resource-header";
        templateURL = "/templates/partials-resource/resource-header.html";
      } else {
        className = "project-header";
        templateURL = "/templates/partials-project/project-header.html";
      }
      this.$header = $("<div class='" + className + "'/>");
      this.$header.template(this.templateDir + templateURL, {
        data: this.viewData
      }, function() {
        return _this.onHeaderLoaded();
      });
      return this.$el.prepend(this.$header);
    },
    onHeaderLoaded: function() {
      var config, id;
      id = this.model.get("id");
      config = {
        id: id
      };
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
      if (this.isResource) {
        this.updatesView.show();
        this.updatesView.on('ON_TEMPLATE_LOAD', function() {
          var userAvatar;
          userAvatar = $('.profile-nav-header img').attr('src');
          return _this.wysiwygFormView = new WysiwygFormView({
            parent: "#add-resource-update",
            id: _this.model.get("id"),
            slim: true,
            userAvatar: userAvatar
          });
        });
        console.log('wysiwygFormView', this.wysiwygFormView);
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
          var feedback;
          if (response.success) {
            feedback = _this.isResource ? 'Following!' : 'Joined!';
            _this.isMember = true;
            return $join.html(feedback).css('background-color', '#e6e6e6');
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
