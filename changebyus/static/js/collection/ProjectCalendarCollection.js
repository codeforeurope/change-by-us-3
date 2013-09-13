define(["underscore", "backbone", "model/ProjectCalendarModel"], function(_, Backbone, ProjectCalendarModel) {

    var ProjectCalendarCollection = Backbone.Collection.extend({
        model: ProjectCalendarModel, 
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectCalendarCollection;
});