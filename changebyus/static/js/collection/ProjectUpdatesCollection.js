define(["underscore", "backbone", "model/ProjectMemberModel"], function(_, Backbone, ProjectUpdatesModel) {

    var ProjectUpdatesCollection = Backbone.Collection.extend({
        model: ProjectUpdatesModel,
        url: '/api/project/:id/list_calendar',
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectUpdatesCollection;
});