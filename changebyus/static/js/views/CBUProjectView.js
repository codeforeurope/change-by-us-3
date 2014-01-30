define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectDonationModalView", "views/partials-universal/UpdatesView", "views/partials-universal/WysiwygFormView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/UpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectDonationModalView, UpdatesView, WysiwygFormView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, UpdatesCollection) {
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
    initialize: function(options_) {
      var options,
        _this = this;
      options = options_;
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
      "click #flag": "flagProject",
      "click .follow": "joinProject",
      "click .donation-header .btn": "onDonateClick",
      "click  a[href^='#']": "changeHash"
    },
    render: function() {
      var className, templateURL,
        _this = this;
      this.viewData = this.model.attributes;
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
    notMember: function() {
      var $notMember,
        _this = this;
      console.log('notMember');
      $('.tabs-pane').remove();
      $notMember = $("<div class='body-container'/>");
      $notMember.template(this.templateDir + "/templates/partials-project/project-not-member.html", {
        data: this.viewData
      }, function() {});
      return this.$el.append($notMember);
    },
    /* EVENTS ---------------------------------------------*/

    onTemplateLoad: function() {
      this.getMemberStatus();
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    onHeaderLoaded: function() {
      var config, id;
      id = this.model.get("id");
      config = {
        id: id
      };
      if (this.isMember === false && this.model.get("private")) {
        return this.notMember();
      } else {
        this.updatesCollection = new UpdatesCollection(config);
        this.projectMembersCollection = new ProjectMembersCollection(config);
        this.projectMembersCollection.on("reset", this.onCollectionLoad, this);
        return this.projectMembersCollection.fetch({
          reset: true
        });
      }
    },
    onCollectionLoad: function() {
      var parent,
        _this = this;
      parent = this.isResource ? "#resource-updates" : "#project-updates";
      this.updatesView = new UpdatesView({
        model: this.model,
        collection: this.updatesCollection,
        members: this.projectMembersCollection,
        isMember: this.isMember,
        isOwnerOrganizer: this.isOwnerOrganizer,
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
      } else {
        this.projectMembersView = new ProjectMembersView({
          model: this.model,
          collection: this.projectMembersCollection,
          isDataLoaded: true,
          isMember: this.isMember,
          isOwnerOrganizer: this.isOwnerOrganizer,
          isOwner: this.isOwner
        });
        this.projectCalenderView = new ProjectCalenderView({
          model: this.model,
          isMember: this.isMember,
          isOwnerOrganizer: this.isOwnerOrganizer,
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
      var _this = this;
      e.preventDefault();
      return $.post("/api/project/" + this.model.id + "/flag", function(res_) {
        $('.flag-project').css('opacity', 0.25);
        return console.log(res_);
      });
    },
    joinProject: function(e) {
      var $join, id,
        _this = this;
      e.preventDefault();
      if (this.isMember) {
        return;
      }
      if (window.userID === "") {
        return window.location = "/login";
      } else {
        id = this.model.get("id");
        $join = $(".project-footer .btn");
        return $.ajax({
          type: "POST",
          url: "/api/project/join",
          data: {
            project_id: id
          }
        }).done(function(res_) {
          var feedback;
          if (res_.success) {
            feedback = 'Following!';
            _this.isMember = true;
            return $join.html(feedback).css('background-color', '#e6e6e6');
          }
        });
      }
    },
    onDonateClick: function() {
      var projectDonationModalView;
      return projectDonationModalView = new ProjectDonationModalView({
        model: this.model
      });
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
          this.membersBTN.addClass("active");
          break;
        case "calendar":
          this.projectCalenderView.show();
          this.calendarBTN.addClass("active");
          break;
        default:
          this.updatesView.show();
          this.updatesBTN.addClass("active");
      }
      return onPageElementsLoad();
    },
    /* GETTER & SETTERS -----------------------------------------------------------------*/

    getMemberStatus: function() {
      var id,
        _this = this;
      if (window.userID === "") {
        this.isMember = false;
        return this.addHeaderView();
      } else {
        id = this.model.get("id");
        return $.get("/api/project/" + id + "/user/" + window.userID, function(res_) {
          if (res_.success) {
            _this.memberData = res_.data;
            _this.isMember = true === _this.memberData.member || true === _this.memberData.organizer || true === _this.memberData.owner ? true : false;
            _this.isOwnerOrganizer = true === _this.memberData.organizer || true === _this.memberData.owner ? true : false;
            _this.viewData.isMember = _this.isMember;
            _this.viewData.isOwnerOrganizer = _this.isOwnerOrganizer;
            return _this.addHeaderView();
          }
        });
      }
    }
  });
});
