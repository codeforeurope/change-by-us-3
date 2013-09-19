define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectAddUpdateView = ProjectSubView.extend({
        
        parent:"#project",
        
        render:function(){
            var self = this;
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-add-update.html', {data:this.viewData}, function() {
                self.ajaxForm();
            }); 
            $(this.parent).append(this.$el);
        },

        ajaxForm:function(){
            var $signin = $('form[name=add-update]');
            $signin.ajaxForm(function(response) { 
                
                // to do
                // if (success){}
                // if (failure){}
            }); 
        }
         
 
    });

    return ProjectAddUpdateView;
    
});


