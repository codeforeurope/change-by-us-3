define(["underscore", "backbone", "jquery", "template", "abstract-view"],
    function(_, Backbone, $, temp, AbstractView) {
    
    var CreateProjectModalView = AbstractView.extend({
    	initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
            this.render();
        },

        render:function(){
            this.$el = $("<div class='project-preview'/>");
            this.$el.template(this.templateDir + '/templates/partials-universal/create-project-modal.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        }
    });

    return CreateProjectModalView;
    
});


