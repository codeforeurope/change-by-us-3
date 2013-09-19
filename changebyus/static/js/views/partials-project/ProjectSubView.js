define(["underscore", "backbone", "jquery", "template", "abstract-view"], 
    function(_, Backbone, $, temp, AbstractView) {
    
    var ProjectSubView = AbstractView.extend({

        isDataLoaded:false,

        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
            this.render();
        },

        show:function(){
            this.$el.show();
            if (!this.isDataLoaded){
                this.collection.on('reset', this.addAll, this);
                this.collection.fetch({reset: true});
            }
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


