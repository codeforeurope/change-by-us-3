define(["underscore", "backbone", "jquery", "template", "abstract-view"], function(_, Backbone, $, temp, AbstractView) {
  var ResourceProjectPreviewView;
  return ResourceProjectPreviewView = AbstractView.extend({
    isProject: false,
    isResource: false,
    isOwned: false,
    isFollowed: false,
    initialize: function(options) {
      AbstractView.prototype.initialize.call(this, options);
      this.isProject = options.isProject || this.isProject;
      this.isResource = options.isResource || this.isResource;
      this.isOwned = options.isOwned || this.isOwned;
      this.isFollowed = options.isFollowed || this.isFollowed;
      return this.render();
    },
    events: {
      "click .close-x": "close"
    },
    render: function() {
      var viewData,
        _this = this;
      viewData = this.model.attributes;
      viewData.isProject = this.isProject;
      viewData.isResource = this.isResource;
      viewData.isOwned = this.isOwned;
      viewData.isFollowed = this.isFollowed;
      this.$el = $("<li class='project-preview'/>");
      return this.$el.template(this.templateDir + "/templates/partials-universal/project-resource.html", {
        data: viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onFetch: function(r) {
      return $(this.parent).append(this.render());
    },
    close: function() {
      var closeX,
        _this = this;
      closeX = this.$el.find('.close-x');
      closeX.hide();
      return $.ajax({
        type: "POST",
        url: "/api/project/leave",
        data: {
          project_id: this.model.id
        }
      }).done(function(response) {
        if (response.success) {
          _this.model.collection.remove(_this.model);
          return _this.$el.remove();
        } else {
          return closeX.show();
        }
      });
    }
  });
});
