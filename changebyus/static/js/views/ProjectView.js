define(["underscore", "backbone", "jquery"], function(_, Backbone, $) {
    
    var ProjectView = Backbone.View.extend({

        tagName:  "li",

        render: function() {
        	var dataObj = {data:this.model.toJSON()}
            $(this.el).template('/static/templates/project.html', dataObj, function() {});
            return this;
        }
    });

    return ProjectView;
});
