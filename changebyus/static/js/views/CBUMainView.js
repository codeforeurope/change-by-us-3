
define(["underscore", 
        "backbone", 
        "jquery", 
        "template",
        "form",
        "views/partials/ProjectPartialsView",
        "views/partials/BannerImageView", 
        "collection/ProjectListCollection" ], 
    function(_, 
            Backbone, 
            $, 
            temp, 
            form, 
            ProjectPartialsView, 
            BannerImageView, 
            ProjectListCollection) {
    
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
                var bannerParent = self.$el.find(".body-container-wide"),
                    bannerImageView = new BannerImageView({parent:bannerParent}); 

                self.collection.on('reset', self.addAll, self);
                self.collection.fetch({reset: true});

                self.ajaxForm();
            });
        },

        ajaxForm:function(){ 
            // AJAXIFY THE SIGNUP FORM
            var $signup = $('form[name=signup]');
            $signup.ajaxForm(function(response) { 
                console.log(response);
            }); 

            // AJAXIFY THE SIGNIN FORM
            var $signin = $('form[name=signin]');
            $signin.ajaxForm(function(response) { 
                console.log(response);
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

    return CBUMainView;
    
});


