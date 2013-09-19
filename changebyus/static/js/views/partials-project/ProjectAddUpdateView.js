define(["underscore", "backbone", "jquery", "template", "abstract-view"], 
    function(_, Backbone, $, temp, AbstractView) {
    
    var ProjectAddUpdateView = AbstractView.extend({
        
        parent:"#project",
        
        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
            this.render();
        },
        
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


