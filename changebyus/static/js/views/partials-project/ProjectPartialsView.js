define(["underscore", "backbone", "jquery", "template", "abstract-view"], 
    function(_, Backbone, $, temp, AbstractView) {
    
    var ProjectPartialsView = AbstractView.extend({

        tagName:  "li",

        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
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


