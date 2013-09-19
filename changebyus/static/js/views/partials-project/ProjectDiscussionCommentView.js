define(["underscore", "backbone", "jquery", "template", "views/partials/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectDiscussionCommentView = ProjectSubView.extend({
        parent:"#project",
        render:function(){
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-discussion-comment.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el);
            //console.log($(this.parent),this.$el);
        } 
 
    });

    return ProjectDiscussionCommentView;
    
});


