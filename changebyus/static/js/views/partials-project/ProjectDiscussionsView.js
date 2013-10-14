define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], function(_, Backbone, $, temp, ProjectSubView) {
  var ProjectDiscussionsView;
  return ProjectDiscussionsView = ProjectSubView.extend({
    parent: "#project-update",
    render: function() {
      return this.$el = $(this.parent);
    },
    addAll: function() {
      var _this = this;
      console.log('ProjectDiscussionsView addAll', this.collection);
      /*
      				if @collection.models.length is 0
      					@$el.template @templateDir + "/templates/partials-project/project-zero-discussions.html", 
      						{}, =>
      				else
      					@$el.template @templateDir + "/templates/partials-project/project-all-discussions.html",
      						{data:@collection.models}, =>
      */

      return this.$el.template(this.templateDir + "/templates/partials-project/project-all-discussions.html", {
        data: this.collection.models
      }, function() {});
    }
  });
});
