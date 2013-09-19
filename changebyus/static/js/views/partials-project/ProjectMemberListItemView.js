define(["underscore", "backbone", "jquery", "template", "views/partials-project/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectMemberListItemView = ProjectSubView.extend({
        tagName:"li",
        render:function(){ 
            $(this.el).template(this.templateDir + '/templates/partials-project/project-member-list-item.html', {data:this.model.attributes}, function() {});
            return this;
        }
    });

    return ProjectMemberListItemView;
    
});


