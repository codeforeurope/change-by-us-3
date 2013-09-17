define(["underscore", "backbone", "model/ProjectUpdateModel"], function(_, Backbone, ProjectUpdateModel) {

    var ProjectUpdatesCollection = Backbone.Collection.extend({
    	initialize: function(options) {
    		this.id = options.id;
  		},
        model: ProjectUpdateModel, 
        url:function(){
        	return "/api/post/project/"+this.id+"/list_updates";
    	},
        parse: function(response) {
            return (response.msg == "OK") ? response.data : {};
        }
    });

    return ProjectUpdatesCollection;
});