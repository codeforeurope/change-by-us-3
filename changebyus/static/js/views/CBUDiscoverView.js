define(["underscore", 
        "backbone", 
        "jquery", 
        "template",
        "views/partials-discover/BannerSearchView",
        "views/partials-project/ProjectPartialsView", 
        "collection/ProjectListCollection"], 
    function(_, 
             Backbone, 
             $, 
             temp, 
             BannerSearchView,
             ProjectPartialsView,
             ProjectListCollection) {
    
    var CBUDiscoverView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},
        bannerSearchView:null,

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData; 
            this.collection  = options.collection || new ProjectListCollection();
            this.render();
        },

        render:function(){
            var self = this;
            this.$el = $("<div class='discover'/>");
            this.$el.template(this.templateDir + '/templates/discover.html', {data:this.viewData}, function() { 
                $(self.parent).append(self.$el); 
                var searchParent = self.$el.find(".content");
                var bannerSearchView = new BannerSearchView({parent:searchParent});

                self.collection.on('reset', self.addAll, self);
                self.collection.fetch({reset: true});
             });
        },

        addOne: function(projectModel) {
            var view = new ProjectPartialsView({model: projectModel}); 
            this.$el.find("#project-list").append(view.el);
        },

        addAll: function() {   
            var self = this;
            this.collection.each(function(projectModel){
                self.addOne(projectModel);
            });
        }

    });

    return CBUDiscoverView;
    
});