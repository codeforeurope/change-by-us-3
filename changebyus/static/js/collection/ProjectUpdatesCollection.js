define(["underscore", "backbone", "model/ProjectUpdateModel"], function(_, Backbone, ProjectUpdateModel) {

    var ProjectUpdatesCollection = Backbone.Collection.extend({
    	initialize: function(options) {
    		this.id = options.id;
  		},
        model: ProjectUpdateModel, 
        url:function(){
        	return "/api/project/"+this.id+"/list_updates";
    	},
        parse: function(response) {
        	console.log('res',response);
            return response.data;
        }
    });

    return ProjectUpdatesCollection;
});