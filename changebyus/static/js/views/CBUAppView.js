
define(["underscore", "backbone", "jquery", "template","views/ProjectView", "collection/ProjectListCollection" ], function(_, Backbone, $, temp, ProjectView, ProjectListCollection) {
    
    var CBUAppView = Backbone.View.extend({

        initialize: function(options) {
            var templateDir = options.templateDir || '/static';
            this.parent     = options.parent || this.parent;
            this.collection = options.collection || this.collection;
            this.render(templateDir);
        },

        render:function(templateDir, parentElt){
            var self = this;
            this.$el = $("<div class='projects-main'/>");
            this.$el.template(templateDir + '/templates/main.html', {}, function() {
                self.collection.on('reset', self.addAll, self);
                self.collection.fetch({reset: true});
            });
            $(this.parent).prepend(this.$el);
            console.log("render this.$el",this.$el);
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

    return CBUAppView;
    
});


