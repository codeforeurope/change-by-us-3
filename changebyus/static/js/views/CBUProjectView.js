define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectCalenderView", "views/partials-project/ProjectMembersView", "views/partials-project/ProjectUpdatesView", "model/ProjectModel", "collection/ProjectCalendarCollection", "collection/ProjectMembersCollection", "collection/ProjectUpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ProjectCalenderView, ProjectMembersView, ProjectUpdatesView, ProjectModel, ProjectCalendarCollection, ProjectMembersCollection, ProjectUpdatesCollection) {
  var CBUProjectView;
  return CBUProjectView = AbstractView.extend({
    isOwner: false,
    isMember: false,
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
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var id,
        _this = this;
      id = this.model.get("id");
      return $.ajax({
        type: "GET",
        url: "/api/project/am_i_a_member/" + id
      }).done(function(response) {
        var e;
        try {
          if (response.data.member) {
            _this.isMember = true;
          }
        } catch (_error) {
          e = _error;
          console.log(e);
        }
        _this.viewData = _this.model.attributes;
        _this.viewData.isMember = _this.isMember;
        return _this.addSubViews();
      });
    },
    addSubViews: function() {
      var _this = this;
      this.$header = $("<div class='project-header'/>");
      return this.$header.template(this.templateDir + "/templates/partials-project/project-header.html", {
        data: this.viewData
      }, function() {
        return _this.onHeaderLoaded();
      });
    },
    onHeaderLoaded: function() {
      var config, id;
      id = this.model.get("id");
      config = {
        id: id
      };
      if (this.isMember === false) {
        this.$header.find('.invisible').removeClass('invisible');
      }
      console.log('@$header', this.$header, this.isMember);
      this.$el.prepend(this.$header);
      this.projectUpdatesCollection = new ProjectUpdatesCollection(config);
      this.projectMembersCollection = new ProjectMembersCollection(config);
      this.projectMembersCollection.on("reset", this.onCollectionLoad, this);
      return this.projectMembersCollection.fetch({
        reset: true
      });
    },
    onCollectionLoad: function() {
      var _this = this;
      console.log("onCollectionLoad");
      this.projectUpdatesView = new ProjectUpdatesView({
        collection: this.projectUpdatesCollection,
        members: this.projectMembersCollection,
        isMember: this.isMember
      });
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
      $("a[href^='#']").click(function(e) {
        return window.location.hash = $(this).attr("href").substring(1);
      });
      return this.btnListeners();
    },
    btnListeners: function() {
      var $join, id,
        _this = this;
      $('.flag-project a').click(function(e) {
        var $this, url,
          _this = this;
        e.preventDefault();
        $this = $(this);
        $this.parent().css('opacity', 0.25);
        url = $this.attr('href');
        return $.ajax({
          type: "POST",
          url: url
        }).done(function(response_) {
          return console.log(response_);
        });
      });
      id = this.model.get("id");
      $join = $(".project-footer .btn");
      return $join.click(function(e) {
        e.preventDefault();
        if (_this.isMember) {
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
            _this.isMember = true;
            return $join.html('Joined!').css('background-color', '#e6e6e6');
          }
        });
      });
    },
    toggleSubView: function() {
      var btn, v, view, _i, _j, _len, _len1, _ref, _ref1;
      view = window.location.hash.substring(1);
      _ref = [this.projectUpdatesView, this.projectMembersView, this.projectCalenderView];
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
          this.projectUpdatesView.show();
          return this.updatesBTN.addClass("active");
      }
    }
  });
});
