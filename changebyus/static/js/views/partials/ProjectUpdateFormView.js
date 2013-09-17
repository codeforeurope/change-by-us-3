define(["underscore", 
        "backbone", 
        "jquery", 
        "template",
        "form"],

    function(_, 
             Backbone, 
             $, 
             temp, 
             form) {
    
    var ProjectUpdateFormView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || {};
            this.render();
        },

        render:function(){ 
            var self = this;
            this.viewData = {project_id:window.projectID, response_id:"PLACEHOLDER"};
            this.$el = $("<div class='project-update-form'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-update-form.html', {data:this.viewData}, function() {
                self.ajaxForm();
            });
            $(this.parent).append(this.$el);
        },

        ajaxForm:function(){ 
            // AJAXIFY THE FORM
            var $updateForm = $('form[name="project-update"]');
            $updateForm.ajaxForm(function(response) { 
                console.log(response);
            }); 
 
        }
 
    });

    return ProjectUpdateFormView;
    
});


