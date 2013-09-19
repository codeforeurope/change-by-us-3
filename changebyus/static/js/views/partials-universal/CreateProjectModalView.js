define(["underscore", "backbone", "jquery", "template", "views/partials/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var CreateProjectModalView = ProjectSubView.extend({
        render:function(){
            this.$el = $("<div class='project-preview'/>");
            this.$el.template(this.templateDir + '/templates/partials-universal/project-create-modal.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        }
    });

    return CreateProjectModalView;
    
});


