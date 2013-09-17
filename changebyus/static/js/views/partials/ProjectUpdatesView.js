define(["underscore", "backbone", "jquery", "template", "views/partials/ProjectSubView","views/partials/ProjectUpdateFormView"], 
    function(_, Backbone, $, temp, ProjectSubView, ProjectUpdateFormView) {
    
    var ProjectUpdatesView = ProjectSubView.extend({
        parent:"#project-update",
        
        render:function(){ 
            var self = this;
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-updates.html', {data:this.viewData}, function() {
                self.$el.find('.preload').remove();
                var form = new ProjectUpdateFormView({parent:self.$el});
            });
            $(this.parent).append(this.$el);  
        },
        
        addOne: function(model) {
            //to do 
            //var view = new Partial();
            //this.$el.append(view);
        }
 
    });

    return ProjectUpdatesView;
    
});


