define(["underscore", "backbone"], function(_, Backbone) {
    var ProjectModel = Backbone.Model.extend(defaults: {
        name:"",
        description: "",
        category: "",
        zip:"",
        website:"",
        visibility:"private"
    });
    return ProjectModel;
});