
define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
    
    var CBUProjectView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData; 
            this.collection  = options.collection || this.collection;
            this.render();
        },

        render:function(){
            // var self = this;
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/project.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        }
 
    });

    return CBUProjectView;
    
});


