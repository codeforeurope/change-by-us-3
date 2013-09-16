define(["underscore", "backbone", "jquery", "template", "views/partials/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectDiscussionsView = ProjectSubView.extend({
        parent:"#project-update",
        
        render:function(){
            this.$el = $("<div class='project'/>");
            $(this.parent).append(this.$el); 
        },
        
        addAll: function() {
            //super();
            if (this.collection.length == 0){
                this.$el.template(this.templateDir + '/templates/partials-project/project-zero-discussions.html', {}, function() {});
            }else{
                this.$el.template(this.templateDir + '/templates/partials-project/project-all-discussions.html', {data:this.viewData}, function() {});
            }
        }
 
    });

    return ProjectDiscussionsView;
    
});


