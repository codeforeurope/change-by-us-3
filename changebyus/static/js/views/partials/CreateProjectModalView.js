define(["underscore", "backbone", "jquery", "template", "views/partials/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var CreateProjectModalView = ProjectSubView.extend({
        render:function(){
            //var self = this;
            this.$el = $("<div class='project-preview'/>");
            this.$el.template(this.templateDir + '/templates/partials-universal/project.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el); 
        },
        loadData:function(){
            // override in subview
        }
    });

    return CreateProjectModalView;
    
});


