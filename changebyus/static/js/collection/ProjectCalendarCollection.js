define(["underscore", "backbone", "model/ProjectCalendarModel"], function(_, Backbone, ProjectCalendarModel) {
  var ProjectCalendarCollection;
  ProjectCalendarCollection = Backbone.Collection.extend({
    initialize: function(options) {
      return this.id = options.id;
    },
    model: ProjectCalendarModel,
    url: function() {
      return "/api/project/" + this.id + "/calendar";
    },
    parse: function(response) {
      if (response.msg === "OK") {
        return response.data;
      } else {
        return {};
      }
    }
  });
  return ProjectCalendarCollection;
});
