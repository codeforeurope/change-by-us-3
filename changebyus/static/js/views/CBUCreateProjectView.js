

define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
    
    var CBUCreateProjectView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData;  // not sure is this would be the correct one this.model.toJSON()
            this.render();
        },

        render:function(){
            //var self = this;
            //this.$el = $("<div class='create-project'/>");
            //this.$el.template(this.templateDir + '/templates/partials-universal/create-form.html', {data:this.viewData}, function() {});
            //$(this.parent).append(this.$el); 
        }
 
    });

    return CBUCreateProjectView;
    
});


