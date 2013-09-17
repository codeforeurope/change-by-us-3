define(["underscore", "backbone", "model/ProjectDiscussionCommentModel"], function(_, Backbone, ProjectDiscussionCommentModel) {

    var ProjectDiscussionCommentsCollection = Backbone.Collection.extend({
    	initialize: function(options) {
    		this.id = options.id;
  		}
        model: ProjectDiscussionCommentModel, 
        url:"/api/project/"+this.id+"/discussion_comments",
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectDiscussionCommentsCollection;
});