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
      }, function() {});
    },
    onFetch: function(r) {
      return $(this.parent).append(this.render());
    }
  });
});
