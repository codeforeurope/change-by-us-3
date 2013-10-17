define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectUpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/ProjectUpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectUpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, ProjectUpdatesCollection) {
  var CBUProjectView;
  return CBUProjectView = AbstractView.extend({
    projectCalenderView: null,
    projectMembersView: null,
    projectUpdatesView: null,
    updatesBTN: null,
    membersBTN: null,
    calendarBTN: null,
    $header: null,
    initialize: function(options) {
      var _this = this;
      console.log('CBUProjectView options', options);
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.model = new ProjectModel(options.model);
      this.collection = options.collection || this.collection;
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    render: function() {
      var _this = this;
      console.log('CBUProjectView', this.model);
      this.$el = $("<div class='project-container'/>");
      this.$el.template(this.templateDir + "/templates/project.html", {}, function() {
        return _this.addSubViews();
      });
      return $(this.parent).append(this.$el);
    },
    addSubViews: function() {
      var _this = this;
      this.$header = $("<div class='project-header'/>");
      return this.$header.template(this.templateDir + "/templates/partials-project/project-header.html", {
        data: this.model.attributes
      }, function() {
        var config, hash, id, projectCalendarCollection, projectMembersCollection, projectUpdatesCollection;
        id = _this.model.get("id");
        config = {
          id: id
        };
        projectUpdatesCollection = new ProjectUpdatesCollection(config);
        projectMembersCollection = new ProjectMembersCollection(config);
        projectCalendarCollection = new ProjectCalendarCollection(config);
        _this.projectUpdatesView = new ProjectUpdatesView({
          collection: projectUpdatesCollection
        });
        _this.projectMembersView = new ProjectMembersView({
          collection: projectMembersCollection
        });
        _this.projectCalenderView = new ProjectCalenderView({
          collection: projectCalendarCollection
        });
        _this.updatesBTN = $("a[href='#updates']");
        _this.membersBTN = $("a[href='#members']");
        _this.calendarBTN = $("a[href='#calendar']");
        hash = window.location.hash.substring(1);
        _this.toggleSubView((hash === "" ? "updates" : hash));
        $(window).bind("hashchange", function(e) {
          hash = window.location.hash.substring(1);
          return _this.toggleSubView(hash);
        });
        $("a[href^='#']").click(function(e) {
          return window.location.hash = $(this).attr("href").substring(1);
        });
        _this.$el.prepend(_this.$header);
        return _this.joingBTN();
      });
    },
    joingBTN: function() {
      var $join, id, joined,
        _this = this;
      id = this.model.get("id");
      joined = false;
      $join = $(".project-footer .btn");
      $join.click(function(e) {
        e.preventDefault();
        if (joined) {
          return;
        }
        return $.ajax({
          type: "POST",
          url: "/api/project/join",
          data: {
            project_id: id
          }
        }).done(function(response) {
          if (response.msg.toLowerCase() === "ok") {
            joined = true;
            $join.html('Joined');
            return $join.css('background-color', '#e6e6e6');
          }
        });
      });
      $join.addClass('invisible');
      return $.ajax({
        type: "POST",
        url: "/api/project/am_i_a_member",
        data: {
          project_id: id
        }
      }).done(function(response) {
        console.log('response.data.member', response.data.member, $join);
        if (response.data.member === false) {
          return $join.removeClass('invisible');
        }
      });
    },
    toggleSubView: function(view) {
      this.projectUpdatesView.hide();
      this.projectMembersView.hide();
      this.projectCalenderView.hide();
      this.updatesBTN.removeClass("active");
      this.membersBTN.removeClass("active");
      this.calendarBTN.removeClass("active");
      switch (view) {
        case "members":
          this.projectMembersView.show();
          return this.membersBTN.addClass("active");
        case "calendar":
          this.projectCalenderView.show();
          return this.calendarBTN.addClass("active");
        default:
          this.projectUpdatesView.show();
          return this.updatesBTN.addClass("active");
      }
    }
  });
});
