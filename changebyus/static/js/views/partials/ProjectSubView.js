define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
    
    var ProjectSubView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},
        isDataLoaded:false
        ajaxRequest:null

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData; 
        },

        show:function(){
            this.$el.show();
            if (!this.isDataLoaded){
                this.collection.on('reset', this.addAll, this);
                this.collection.fetch({reset: true});
            }
        },

        hide:function(){
            this.$el.show();
        },
        
        loadData:function(){
            // override in subview
        },

        addOne: function(projectModel) {
            // override in subview
        },

        addAll: function() {
            var self = this;
            this.collection.each(function(projectModel){
                self.addOne(projectModel);
            });
            this.isDataLoaded = true;
        }
    });

    return ProjectSubView;
    
});


