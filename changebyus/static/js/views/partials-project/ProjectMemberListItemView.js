define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectMemberListItemView;
  return ProjectMemberListItemView = AbstractView.extend({
    tagName: "li",
    view: "public",
    projectID: 0,
    initialize: function(options_) {
      console.log('initialize initialize initialize initialize');
      AbstractView.prototype.initialize.call(this, options_);
      this.view = options_.view || this.view;
      this.projectID = options_.projectID || this.projectID;
      this.viewData = this.model.attributes;
      this.viewData.view = this.view;
      this.viewData.sid = Math.random().toString(20).substr(2);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.el);
      this.$el.template(this.templateDir + "/templates/partials-project/project-member-list-item.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
      return this;
    },
    onTemplateLoad: function() {
      var _this = this;
      console.log('onTemplateLoad onTemplateLoad onTemplateLoad');
      return delay(1, function() {
        var $dk;
        if (_this.view === "admin") {
          $dk = $("#" + _this.viewData.sid).dropkick({
            change: function(value_, label_) {
              return $.ajax({
                type: "POST",
                url: "/api/project/change_user_role",
                data: {
                  project_id: _this.projectID,
                  user_id: _this.model.id,
                  user_role: value_
                }
              }).done(function(response_) {
                if (response_.msg.toLowerCase() === "ok") {
                  $dk = null;
                  return _this.model.set('roles', [value_]);
                }
              });
            }
          });
          return console.log($dk);
        }
      });
    }
  });
});
