define(["underscore", "backbone", "jquery", "template", "abstract-view"], 
    function(_, Backbone, $, temp, AbstractView) {
    
    var ProjectDiscussionCommentView = AbstractView.extend({
        parent:"#project",

        initialize: function(options) {
            AbstractView.prototype.initialize.apply(this, options);
            this.render();
        },
        
        render:function(){
            this.$el = $("<div class='project'/>");
            this.$el.template(this.templateDir + '/templates/partials-project/project-discussion-comment.html', {data:this.viewData}, function() {});
            $(this.parent).append(this.$el);
            //console.log($(this.parent),this.$el);
        } 
 
    });

    return ProjectDiscussionCommentView;
    
});


