define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ProjectMemberListItemView;
  return ProjectMemberListItemView = AbstractView.extend({
    tagName: "li",
    view: "public",
    projectID: 0,
    initialize: function(options_) {
      AbstractView.prototype.initialize.call(this, options_);
      this.view = options_.view || this.view;
      this.projectID = options_.projectID || this.projectID;
      this.viewData = this.model.attributes;
      this.viewData.view = this.view;
      this.viewData.sid = Math.random().toString(20).substr(2);
      return this.render();
    },
    events: {
      "click .delete-x": "deleteItem"
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
      if (this.view === "admin") {
        return delay(1, function() {
          return _this.addDropKick();
        });
      }
    },
    addDropKick: function() {
      var _this = this;
      return $("#" + this.viewData.sid).dropkick({
        change: function(value_, label_) {
          return $.ajax({
            type: "POST",
            url: "/api/project/change-user-role",
            data: {
              project_id: _this.projectID,
              user_id: _this.model.id,
              user_role: value_
            }
          }).done(function(response_) {
            if (response_.success) {
              return _this.model.set('roles', [value_]);
            }
          });
        }
      });
    },
    deleteItem: function() {
      var dataObj,
        _this = this;
      dataObj = {
        project_id: this.projectID,
        user_id: this.model.id
      };
      return $.ajax({
        type: "POST",
        url: "/api/project/remove-member",
        data: JSON.stringify(dataObj),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).done(function(response_) {
        var c;
        if (response_.msg.toLowerCase() === "ok") {
          return c = _this.model.collection;
        }
      });
    }
  });
});
