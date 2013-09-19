define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectInfoAppearanceView = ProjectSubView.extend({
        parent:"#project-calendar",
        render:function(){
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-info-appearance.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        } 
    });
    return ProjectInfoAppearanceView;
});