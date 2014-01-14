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
      this.viewData = this.model.attributes;
      this.viewData.isProject = options.isProject || this.isProject;
      this.viewData.isOwned = options.isOwned || this.isOwned;
      this.viewData.isFollowed = options.isFollowed || this.isFollowed;
      return this.viewData.isAdmin = options.isAdmin || this.isAdmin;
    },
    events: {
      "click .close-x": "close",
      "click .btn-tertiary": "unflag",
      "click .btn-warning": "delete"
    },
    render: function() {
      var _this = this;
      this.$el = $("<li class='project-preview'/>");
      return this.$el.template(this.templateDir + "/templates/partials-universal/project-resource.html", {
        data: this.viewData
      }, function() {
        _this.onTemplateLoad();
        return _this.$el.find('img').load(function() {
          return onPageElementsLoad();
        });
      });
    },
    onFetch: function(r) {
      return $(this.parent).append(this.render());
    },
    close: function(e) {
      var $closeX, dataObj,
        _this = this;
      $closeX = $(e.currentTarget);
      $closeX.hide();
      console.log('$(e.currentTarget)', $(e.currentTarget));
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
