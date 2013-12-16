define(["underscore", "backbone", "model/ProjectCalendarModel"], function(_, Backbone, ProjectCalendarModel) {
  var ProjectCalendarCollection;
  return ProjectCalendarCollection = Backbone.Collection.extend({
    model: ProjectCalendarModel,
    initialize: function(options) {
      return this.id = options.id;
    },
    url: function() {
      return "/api/project/" + this.id + "/calendar";
    },
    parse: function(response) {
      if (response.success) {
        return response.data;
      } else {
        return {};
      }
    }
  });
});
