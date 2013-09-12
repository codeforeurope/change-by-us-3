
define(["underscore", "backbone", "jquery", "template","views/ProjectView","views/partials/BannerImageView", "collection/ProjectListCollection" ], function(_, Backbone, $, temp, ProjectView, BannerImageView, ProjectListCollection) {
    
    var CBUMainView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData: {},
        collection: {},

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData; 
            this.collection  = options.collection || new ProjectListCollection();
            this.render();
        },

        render:function(){
            var self = this;
            this.$el = $("<div class='projects-main'/>");
            this.$el.template(this.templateDir + '/templates/main.html', {}, function() {
                $(self.parent).prepend(self.$el);
                var bannerParent = self.$el.find(".body-container-wide", this.$el);
                var bannerImageView = new BannerImageView({parent:bannerParent});

                self.collection.on('reset', self.addAll, self);
                self.collection.fetch({reset: true});
            });
        },

        addOne: function(projectModel) {
            var view = new ProjectView({model: projectModel}); 
            this.$el.find("#project-list").append(view.render().el);
        },

        addAll: function() {   
            var self = this;
            this.collection.each(function(projectModel){
                self.addOne(projectModel);
            });
        }
    });

    return CBUMainView;
    
});


