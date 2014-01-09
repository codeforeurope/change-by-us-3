define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ResourceProjectPreviewView;
  return ResourceProjectPreviewView = AbstractView.extend({
    isProject: false,
    isResource: false,
    isOwned: false,
    isFollowed: false,
    isAdmin: false,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.isProject = options.isProject || this.isProject;
      this.isOwned = options.isOwned || this.isOwned;
      this.isFollowed = options.isFollowed || this.isFollowed;
      return this.isAdmin = options.isAdmin || this.isAdmin;
    },
    events: {
      "click .close-x": "close",
      "click .btn-tertiary": "unflag",
      "click .btn-warning": "delete"
    },
    render: function() {
      var viewData,
        _this = this;
      viewData = this.model.attributes;
      viewData.isProject = this.isProject;
      viewData.isOwned = this.isOwned;
      viewData.isFollowed = this.isFollowed;
      viewData.isAdmin = this.isAdmin;
      this.$el = $("<li class='project-preview'/>");
      return this.$el.template(this.templateDir + "/templates/partials-universal/project-resource.html", {
        data: viewData
      }, function() {
        return _this.$el.find('img').load(function() {
          return _this.onTemplateLoad();
        });
      });
    },
    onFetch: function(r) {
      return $(this.parent).append(this.render());
    },
    close: function() {
      var $closeX, dataObj,
        _this = this;
      $closeX = this.$el.find('.close-x');
      $closeX.hide();
      dataObj = {
        project_id: this.model.id
      };
      return $.ajax({
        type: "POST",
        url: "/api/project/leave",
        data: JSON.stringify(dataObj),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).done(function(response_) {
        if (response_.success) {
          _this.model.collection.remove(_this.model);
          return _this.$el.remove();
        } else {
          return $closeX.show();
        }
      });
    },
    "delete": function(e) {
      var _this = this;
      e.preventDefault();
      return $.post("/api/project/" + this.model.id + "/delete", function(res_) {
        if (res_.success) {
          _this.model.collection.remove(_this.model);
          return _this.$el.remove();
        }
      });
    },
    unflag: function(e) {
      var _this = this;
      e.preventDefault();
      return $.post("/api/project/" + this.model.id + "/unflag", function(res_) {
        if (res_.success) {
          _this.model.collection.remove(_this.model);
          return _this.$el.remove();
        }
      });
    }
  });
});
