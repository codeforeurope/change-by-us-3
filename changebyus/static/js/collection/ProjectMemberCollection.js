define(["underscore", "backbone", "model/ProjectMemberModel"], function(_, Backbone, ProjectMemberModel) {

    var ProjectMemberCollection = Backbone.Collection.extend({
        model: ProjectMemberModel,
        url: '/api/project/:id/user',
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectMemberCollection;
});