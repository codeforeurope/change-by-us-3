define(["underscore", "backbone", "model/ProjectCalendarModel"], function(_, Backbone, ProjectCalendarModel) {

    var ProjectCalendarCollection = Backbone.Collection.extend({
    	initialize: function(options) {
    		this.id = options.id;
  		},
        model: ProjectCalendarModel,
        url:function(){
        	return "/api/project/"+this.id+"/calendar";
    	},
        parse: function(response) {
            return response.data;
        }
    });

    return ProjectCalendarCollection;
});