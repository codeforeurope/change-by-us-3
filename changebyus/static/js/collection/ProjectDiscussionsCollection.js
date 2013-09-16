define(["underscore", "backbone", "model/ProjectDiscussionModel"], function(_, Backbone, ProjectDiscussionModel) {

    var ProjectDiscussionsCollection = Backbone.Collection.extend({
        model: ProjectDiscussionModel, 
        url:"/api/project/"+window.projectID+"/discussions_list",
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectDiscussionsCollection;
});