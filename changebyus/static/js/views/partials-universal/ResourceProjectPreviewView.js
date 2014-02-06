define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ResourceProjectPreviewView;
  return ResourceProjectPreviewView = AbstractView.extend({
    isProject: false,
    isResource: false,
    isOwned: false,
    isFollowed: false,
    isAdmin: false,
    isDiscovered: false,
    initialize: function(options_) {
      var options;
      options = options_;
      AbstractView.prototype.initialize.call(this, options);
      this.viewData = this.model.attributes;
      this.viewData.isProject = options.isProject || this.isProject;
      this.viewData.isOwned = options.isOwned || this.isOwned;
      this.viewData.isFollowed = options.isFollowed || this.isFollowed;
      this.viewData.isAdmin = options.isAdmin || this.isAdmin;
      return this.viewData.isDiscovered = options.isDiscovered || this.isDiscovered;
    },
    events: {
      "click .close-x": "close",
      "click .unflag": "unflag",
      "click .delete-project": "delete",
      "click .approve": "approve",
      "click .reject": "reject"
    },
    render: function() {
      var _this = this;
      this.$el = $("<li class='project-preview'/>");
      return this.$el.template(this.templateDir + "/templates/partials-universal/project-resource.html", {
        data: this.viewData
      }, function() {
        _this.delegateEvents();
        return _this.$el.find('img').hide().load(function() {
          _this.$el.find('img').fadeIn('slow');
          return _this.onTemplateLoad();
        });
      });
    },
    /* EVENTS ---------------------------------------------*/

    onFetch: function(r) {
      return $(this.parent).append(this.render());
    },
    close: function(e) {
      var $closeX, dataObj,
        _this = this;
      $closeX = $(e.currentTarget);
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
    unflag: function(e) {
      var _this = this;
      e.preventDefault();
      return $.post("/api/project/" + this.model.id + "/unflag", function(res_) {
        return _this.onResponce(res_);
      });
    },
    "delete": function(e) {
      var confirmation,
        _this = this;
      e.preventDefault();
      confirmation = confirm("Are you sure you want to delete " + (this.model.get('name')) + "?");
      if (confirmation) {
        return $.ajax({
          type: "DELETE",
          url: "/api/project/" + this.model.id
        }).done(function(res_) {
          return _this.onResponce(res_);
        });
      }
    },
    approve: function(e) {
      var confirmation,
        _this = this;
      e.preventDefault();
      confirmation = confirm("Are you sure you want to approve " + (this.model.get('name')) + "?");
      if (confirmation) {
        return $.post("/api/resource/" + this.model.id + "/approve", function(res_) {
          return _this.onResponce(res_);
        });
      }
    },
    reject: function(e) {
      var confirmation,
        _this = this;
      e.preventDefault();
      confirmation = confirm("Are you sure you want to reject " + (this.model.get('name')) + "?");
      if (confirmation) {
        return $.ajax({
          type: "DELETE",
          url: "/api/resource/" + this.model.id
        }).done(function(res_) {
          return _this.onResponce(res_);
        });
      }
    },
    onResponce: function(res_) {
      if (res_.success) {
        this.model.collection.remove(this.model);
        return this.$el.remove();
      }
    }
  });
});
