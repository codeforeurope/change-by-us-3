define(["underscore", "backbone", "model/ProjectCalendarModel"], function(_, Backbone, ProjectCalendarModel) {
  var ProjectCalendarCollection;
  return ProjectCalendarCollection = Backbone.Collection.extend({
    model: ProjectCalendarModel,
    initialize: function(options_) {
      return this.id = options_.id;
    },
    url: function() {
      return "/api/project/" + this.id + "/calendar";
    },
    parse: function(response_) {
      if (response_.success) {
        return response_.data;
      } else {
        return {};
      }
    }
  });
});
