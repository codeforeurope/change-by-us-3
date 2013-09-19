define(["underscore", 
        "backbone", 
        "jquery", 
        "template",
        "form",
        "abstract-view"],
        
    function(_, 
             Backbone, 
             $, 
             temp, 
             form,  
             AbstractView) {
    
    var CreateProjectView = AbstractView.extend({

        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
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
            var $submit = $('input[type=submit]'),
                $form   = $('form[name=createproject]')

                options = { 
                beforeSubmit: function() { 
                    $submit.prop('disabled', true);
                },
                success: function(res) { 
                    console.log('res',res);
                    
                    var createProjectModalView = new CreateProjectView({viewData:res})

                    $submit.prop('disabled', false); 
                    if (res.success){ $form.resetForm(); }
                }
            } 
            $form.ajaxForm(options);
        }
    });

    return CreateProjectView;
    
});


