define(["underscore", "backbone", "jquery", "template"], 
    function(_, Backbone, $, temp) {
    
    var AbstractView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},

        initialize: function(options_) {
            var options      = options_ || {};
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData;
        },

        show:function(){
            this.$el.show();
        },

        hide:function(){
            this.$el.hide();
        }
    });

    return AbstractView;
    
});


