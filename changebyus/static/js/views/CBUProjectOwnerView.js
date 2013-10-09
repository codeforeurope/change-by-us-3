define(["underscore", "backbone", "jquery", "template", "project-view"], function(_, Backbone, $, temp, CBUProjectView) {
  var CBUProjectOwnerView;
  return CBUProjectOwnerView = CBUProjectView.extend({
    initialize: function(options) {
      return CBUProjectView.prototype.initialize.call(this, options);
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='project-container'/>");
      this.$el.template(this.templateDir + "/templates/project-owner.html", {}, function() {
        return _this.addSubViews();
      });
      return $(this.parent).append(this.$el);
    },
    addSubViews: function() {
      var $header,
        _this = this;
      $header = $("<div class='project-header'/>");
      $header.template(this.templateDir + "/templates/partials-project/project-owner-header.html", {
        data: this.model.attributes
      }, function() {
        var hash, id;
        id = {
          id: _this.model.get("id")
        };
        _this.discussionBTN = $("a[href='#discussion']");
        _this.updatesBTN = $("a[href='#updates']");
        _this.fundraisingBTN = $("a[href='#fundraising']");
        _this.calendarBTN = $("a[href='#calendar']");
        _this.membersBTN = $("a[href='#members']");
        _this.infoBTN = $("a[href='#info']");
        _this.projectMembersView.hide();
        _this.projectCalenderView.hide();
        hash = window.location.hash.substring(1);
        _this.toggleSubView((hash === "" ? "updates" : hash));
        $(window).bind("hashchange", function(e) {
          hash = window.location.hash.substring(1);
          return _this.toggleSubView(hash);
        });
        return $("a[href^='#']").click(function(e) {
          return window.location.hash = $(this).attr("href").substring(1);
        });
      });
      return this.$el.prepend($header);
    },
    toggleSubView: function(view) {
      this.projectUpdatesView.hide();
      this.projectMembersView.hide();
      this.projectCalenderView.hide();
      this.discussionBTN.removeClass("active");
      this.updatesBTN.removeClass("active");
      this.fundraisingBTN.removeClass("active");
      this.calendarBTN.removeClass("active");
      this.membersBTN.removeClass("active");
      this.infoBTN.removeClass("active");
      switch (view) {
        case "discussion":
          return console.log('');
        case "updates":
          this.projectUpdatesView.show();
          return this.updatesBTN.addClass("active");
        case "fundraising":
          return console.log('');
        case "calendar":
          this.projectCalenderView.show();
          return this.calendarBTN.addClass("active");
        case "members":
          this.projectMembersView.show();
          return this.membersBTN.addClass("active");
        case "info":
          return console.log('');
      }
    }
  });
});
