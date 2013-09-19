define(["underscore", "backbone", "jquery", "template", "abstract-view"], 
    function(_, Backbone, $, temp, AbstractView) {
    
    var BannerSearchView = AbstractView.extend({

        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
            this.render();
        },

        render:function(){
            //var self = this;
            this.$el = $("<div class='banner-search'/>");
            this.$el.template(this.templateDir + '/templates/partials-discover/banner-search.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        }
 
    });

    return BannerSearchView;
    
});


