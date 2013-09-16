define(["underscore", "backbone", "jquery", "template"], 
    function(_, Backbone, $, temp) {
    
    var ProjectSubView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},
        isDataLoaded:false,

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData;

            this.render();
        },

        show:function(){
            this.$el.show();
            if (!this.isDataLoaded){
                this.collection.on('reset', this.addAll, this);
                this.collection.fetch({reset: true});
            }
        },

        hide:function(){
            this.$el.hide();
        },
        
        loadData:function(){
            // override in subview
        },

        addOne: function(model) {
            // override in subview
        },

        addAll: function() {
            var self = this;
            this.collection.each(function(model){
                self.addOne(model);
            });
            this.isDataLoaded = true;
        }
    });

    return ProjectSubView;
    
});


