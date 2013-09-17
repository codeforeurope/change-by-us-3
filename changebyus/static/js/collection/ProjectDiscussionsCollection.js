define(["underscore", "backbone", "model/ProjectDiscussionModel"], function(_, Backbone, ProjectDiscussionModel) {

    var ProjectDiscussionsCollection = Backbone.Collection.extend({
    	initialize: function(options) {
    		this.id = options.id;
  		}
        model: ProjectDiscussionModel, 
        url:"/api/project/"+this.id+"/discussions_list",
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectDiscussionsCollection;
});