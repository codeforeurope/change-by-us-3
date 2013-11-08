define(["underscore", "backbone", "jquery", "template", "abstract-view", "collection/ProjectListCollection"], function(_, Backbone, $, temp, AbstractView, ProjectListCollection) {
  var CBUDashboardView;
  return CBUDashboardView = AbstractView.extend({
    initialize: function(options) {
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.viewData = options.viewData || this.viewData;
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el.template(this.templateDir + "/templates/dashboard.html", {}, function() {
        return _this.onTemplateLoad();
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
      this.profileView = $('#edit-profile');
      this.followView = $('#follow-projects');
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
    }
  });
});
