define(["underscore", "backbone", "jquery", "template", "abstract-view"], 
    function(_, Backbone, $, temp, AbstractView) {
    
    var BannerImageView =  AbstractView.extend({

        initialize: function(options) { 
            AbstractView.prototype.initialize.call(this, options);
            this.render();
        },

        render:function(){
            this.$el = $("<div class='banner-image'/>");
            this.$el.template(this.templateDir + '/templates/partials-homepage/banner-image.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el);  
        }
    });

    return BannerImageView;
    
});


