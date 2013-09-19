define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectFundraisingView = ProjectSubView.extend({
        parent:"#project-calendar",
        render:function(){
            this.$el = $("<div class='project'/>");
            if(this.started){
                this.$el.template(this.templateDir + '/templates/partials-project/project-fundraising-goals.html', {data:this.viewData}, function() {});
            }else{
                this.$el.template(this.templateDir + '/templates/partials-project/project-fundraising-get-started.html', {}, function() {});
            }
            
            $(this.parent).append(this.$el); 
        } 
 
    });

    return ProjectFundraisingView;
    
});


