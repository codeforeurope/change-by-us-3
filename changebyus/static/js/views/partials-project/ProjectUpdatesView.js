define(["underscore", 
        "backbone", 
        "jquery", 
        "template", 
        "views/partials/ProjectSubView",
        "views/partials/ProjectUpdateFormView",
        "views/partials/ProjectUpdateListItemView"], 

    function(_, 
             Backbone, 
             $, 
             temp, 
             ProjectSubView, 
             ProjectUpdateFormView, 
             ProjectUpdateListItemView) {
    
    var ProjectUpdatesView = ProjectSubView.extend({
        parent:"#project-update",
        
        render:function(){ 
            var self = this;
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-updates.html', {data:this.viewData}, function() {
                self.$el.find('.preload').remove();
                // temp here for now
                var form = new ProjectUpdateFormView({parent:self.$el});
            });
            $(this.parent).append(this.$el);  
        },
        
        addOne: function(model) {
            console.log('model',model);

            var view = new ProjectUpdateListItemView({model:model});
            this.$el.find('.project-container ul').append(view.el);
        }
 
    });

    return ProjectUpdatesView;
    
});


