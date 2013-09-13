define(["underscore", "backbone", "model/ProjectCalendarModel"], function(_, Backbone, ProjectCalendarModel) {

    var ProjectCalendarCollection = Backbone.Collection.extend({
        model: ProjectCalendarModel, 
        url:"/api/project/"+window.projectID+"/list_updates",
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectCalendarCollection;
});