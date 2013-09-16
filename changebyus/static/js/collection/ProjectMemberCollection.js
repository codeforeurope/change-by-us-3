define(["underscore", "backbone", "model/ProjectMemberModel"], function(_, Backbone, ProjectMemberModel) {

    var ProjectMemberCollection = Backbone.Collection.extend({
    	initialize: function(options) {
    		this.id = options.id;
  		},
        model: ProjectMemberModel, 
       	url:function(){
       		return "/api/project/"+this.id+"/users"
       	},
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectMemberCollection;
});