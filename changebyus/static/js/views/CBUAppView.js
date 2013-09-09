define(["underscore", "backbone", "jquery","views/ProjectView", "collection/ProjectListCollection"], function(_, Backbone, $, ProjectView, ProjectListCollection) {
    
    var templateUrl = '/static';
    
    var CBUAppView = Backbone.View.extend({
        Projects: new ProjectListCollection(),

        initialize: function(options) {
            var self = this,
                parentElt = options.appendTo || $('body');
                
            templateUrl = options.templateUrl || templateUrl;
            
            parentElt.template(templateUrl + '/templates/discover.html', {}, function() {
                self.Projects.bind('reset', self.addAll, self);
                self.Projects.fetch();
            });       
        },

        addOne: function(projectModel) {
            var view = new ProjectView({model: projectModel});
            this.$("#project-list").append(view.render().el);
        },

        addAll: function() {
            this.Projects.each(this.addOne);
        },
    });

    return CBUAppView;
});


