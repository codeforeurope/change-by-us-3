define(["underscore", "backbone", "jquery"], function(_, Backbone, $) {
    
    var ProjectView = Backbone.View.extend({

        tagName:  "li",

        render: function() {
            var self = this;
            $(self.el).template('/static/templates/project.html', self.model.toJSON(), function() {});
            return this;
        }
    });

    return ProjectView;
});
