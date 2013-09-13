define(["underscore", "backbone", "model/ProjectUpdateModel"], function(_, Backbone, ProjectUpdateModel) {

    var ProjectUpdatesCollection = Backbone.Collection.extend({
        model: ProjectUpdateModel, 
        url:"/api/project/"+window.projectID+"/calendar",
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectUpdatesCollection;
});