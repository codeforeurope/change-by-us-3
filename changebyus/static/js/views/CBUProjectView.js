define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectUpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/ProjectUpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectUpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, ProjectUpdatesCollection) {
  var CBUProjectView;
  return CBUProjectView = AbstractView.extend({
    isOwner: false,
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
      this.isOwner = options.isOwner || this.isOwner;
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
        return _this.onHeaderLoaded();
      });
    },
    onHeaderLoaded: function() {
      var config, id, projectCalendarCollection, projectMembersCollection, projectUpdatesCollection,
        _this = this;
      this.$el.prepend(this.$header);
      id = this.model.get("id");
      config = {
        id: id
      };
      projectUpdatesCollection = new ProjectUpdatesCollection(config);
      projectMembersCollection = new ProjectMembersCollection(config);
      projectCalendarCollection = new ProjectCalendarCollection(config);
      this.projectUpdatesView = new ProjectUpdatesView({
        collection: projectUpdatesCollection
      });
      this.projectMembersView = new ProjectMembersView({
        collection: projectMembersCollection
      });
      this.projectCalenderView = new ProjectCalenderView({
        collection: projectCalendarCollection
      });
      this.updatesBTN = $("a[href='#updates']").parent();
      this.membersBTN = $("a[href='#members']").parent();
      this.calendarBTN = $("a[href='#calendar']").parent();
      $(window).bind("hashchange", function(e) {
        return _this.toggleSubView();
      });
      this.toggleSubView();
      $("a[href^='#']").click(function(e) {
        return window.location.hash = $(this).attr("href").substring(1);
      });
      return this.joingBTN();
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
        type: "GET",
        url: "/api/project/am_i_a_member/" + id
      }).done(function(response) {
        var e;
        console.log('response.data.member', response, $join);
        try {
          if (response.data.member === false) {
            return $join.removeClass('invisible');
          }
        } catch (_error) {
          e = _error;
          return console.log(e);
        }
      });
    },
    toggleSubView: function() {
      var view;
      view = window.location.hash.substring(1);
      this.projectUpdatesView.hide();
      this.projectMembersView.hide();
      this.projectCalenderView.hide();
      this.updatesBTN.removeClass("active");
      this.membersBTN.removeClass("active");
      this.calendarBTN.removeClass("active");
      console.log('toggleSubView', this.projectUpdatesView, this.updatesBTN);
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
