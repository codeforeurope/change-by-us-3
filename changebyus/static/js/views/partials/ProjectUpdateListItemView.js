define(["underscore", "backbone", "jquery", "template", "views/partials/ProjectSubView"], 
    function(_, Backbone, $, temp, ProjectSubView) {
    
    var ProjectUpdateListItemView = ProjectSubView.extend({
        tagName:"li",
        render:function(){ 
            $(this.el).template(this.templateDir + '/templates/partials-project/project-update-list-item.html', {data:this.model.attributes}, function() {});
            return this;
        }
    });

    return ProjectUpdateListItemView;
    
});





