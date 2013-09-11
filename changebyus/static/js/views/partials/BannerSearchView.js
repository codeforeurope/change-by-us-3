define(["underscore", "backbone", "jquery", "template"], function(_, Backbone, $, temp) {
    
    var BannerSearchView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData; 
            this.render();
        },

        render:function(){
            //var self = this;
            this.$el = $("<div class='banner-search'/>");
            this.$el.template(this.templateDir + '/templates/partials-discover/banner-search.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        },
 
    });

    return BannerSearchView;
    
});


