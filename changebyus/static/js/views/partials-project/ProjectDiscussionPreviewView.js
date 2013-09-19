define(["underscore", "backbone", "jquery", "template", "abstract-view"], 
    function(_, Backbone, $, temp, AbstractView) {
    
    var ProjectDiscussionPreviewView = AbstractView.extend({
        //parent:"#project-update",
        
        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
            this.render();
        },
        
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


