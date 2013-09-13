define(["underscore", "backbone", "model/ProjectUpdateModel"], function(_, Backbone, ProjectUpdateModel) {

    var ProjectUpdatesCollection = Backbone.Collection.extend({
        model: ProjectUpdateModel, 
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectUpdatesCollection;
});