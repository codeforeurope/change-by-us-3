define(["underscore", "backbone", "jquery", "template"], 
    function(_, Backbone, $, temp) {
    
    var BannerImageView = Backbone.View.extend({

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
            this.$el = $("<div class='banner-image'/>");
            this.$el.template(this.templateDir + '/templates/partials-homepage/banner-image.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        }
 
    });

    return BannerImageView;
    
});


