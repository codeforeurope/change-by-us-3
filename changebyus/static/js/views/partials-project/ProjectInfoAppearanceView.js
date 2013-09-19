define(["underscore", "backbone", "jquery", "template",  "abstract-view"], 
    function(_, Backbone, $, temp, AbstractView) {
    
    var ProjectInfoAppearanceView = AbstractView.extend({
        parent:"#project-calendar",

        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
            this.render();
        },
        
        render:function(){
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-info-appearance.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        } 
    });
    return ProjectInfoAppearanceView;
});