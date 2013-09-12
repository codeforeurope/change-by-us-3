
define(["underscore", "backbone", "jquery", "template","views/partials/BannerSearchView"], function(_, Backbone, $, temp, BannerSearchView) {
    
    var CBUDiscoverView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},
        bannerSearchView:null,

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData; 
            this.collection  = options.collection || this.collection;
            this.render();
        },

        render:function(){
            var self = this;
            this.$el = $("<div class='discover'/>");
            this.$el.template(this.templateDir + '/templates/discover.html', {data:this.viewData}, function() { 
                $(self.parent).append(self.$el); 
                var searchParent = self.$el.find(".content");
                var bannerSearchView = new BannerSearchView({parent:searchParent}); 
             });
            
            
        }
    });

    return CBUDiscoverView;
    
});


