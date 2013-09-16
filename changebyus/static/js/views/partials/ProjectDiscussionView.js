define(["underscore", "backbone", "jquery", "template", "views/partials/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectDiscussionView = ProjectSubView.extend({
        //parent:"#project-update",
        
        render:function(){
            this.$el = $("<div class='project'/>");
            $(this.parent).append(this.$el); 
        },
        
        addOne: function(model) {
            var view = $('<div/>');
            view.template(this.templateDir + '/templates/partials-project/project-discussion.html', {data:this.viewData}, function() {});
            this.$el.append(view);
        }
 
    });

    return ProjectDiscussionView;
    
});


