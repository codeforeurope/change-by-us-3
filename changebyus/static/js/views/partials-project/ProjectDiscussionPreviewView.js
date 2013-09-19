define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectDiscussionPreviewView = ProjectSubView.extend({
        //parent:"#project-update",
        
        render:function(){
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-discussion-preview.html', {data:this.viewData}, function() {
                self.ajaxForm();
            }); 
            $(this.parent).append(this.$el); 
        }
 
    });

    return ProjectDiscussionPreviewView;
    
});


