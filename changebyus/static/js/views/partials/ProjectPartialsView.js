define(["underscore", "backbone", "jquery", "template"], 
    function(_, Backbone, $, temp) {
    
    var ProjectPartialsView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},
        tagName:  "li",

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.model.toJSON();
            this.render();
        },

        render:function(){ 
            $el = $("<div class='project-preview'/>");
            $el.template(this.templateDir + '/templates/partials-universal/project.html', {data:this.viewData}, function() {});
            this.el = $el;
        }
 
    });

    return ProjectPartialsView;
    
});


