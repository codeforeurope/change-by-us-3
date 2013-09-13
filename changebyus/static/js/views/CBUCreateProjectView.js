

define(["underscore", "backbone", "jquery", "template","form","views/partials/CreateProjectModalView"], 
    function(_, Backbone, $, temp, form, CreateProjectModalView) {
    
    var CBUCreateProjectView = Backbone.View.extend({

        parent: 'body',
        templateDir: '/static',
        viewData:{},

        initialize: function(options) {
            this.templateDir = options.templateDir || this.templateDir;
            this.parent      = options.parent || this.parent; 
            this.viewData    = options.viewData || this.viewData;  // not sure is this would be the correct one this.model.toJSON()
            this.render();
        },

        render:function(){
            var self = this;
            this.$el = $("<div class='create-project'/>");
            this.$el.template(this.templateDir + '/templates/partials-universal/create-form.html', {data:this.viewData}, function() {
                self.ajaxForm();
            });
            $(this.parent).append(this.$el);
        },
            
        ajaxForm:function(){ 
            var $submit = $('input[type=submit]');
            var $form   = $('form[name=createproject]');

            var options = { 
                beforeSubmit: function() { 
                    $submit.prop('disabled', true);
                },
                success: function(res) { 
                    console.log('res',res);
                    
                    var createProjectModalView = new CreateProjectModalView({viewData:res})

                    $submit.prop('disabled', false); 
                    if (res.success){ $form.resetForm(); }
                }
            } 
            $form.ajaxForm(options);
        }
    });

    return CBUCreateProjectView;
    
});


