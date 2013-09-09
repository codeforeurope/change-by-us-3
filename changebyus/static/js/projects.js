(function() {
    var TEMPLATE_URL = '/static';
    
    var Project = Backbone.Model.extend({});

    var ProjectList = Backbone.Collection.extend({
        model: Project,
        url: '/api/project/list',
        parse: function(response) {
            return response.data;
        }
    });

    var ProjectView = Backbone.View.extend({         
        tagName:  "li",

        render: function() {
            var self = this;
            $(self.el).template(TEMPLATE_URL + '/templates/project.html', self.model.toJSON(), function() {});
            return this;
        }
    });

    window.MyAppName = Backbone.View.extend({
        Projects: new ProjectList(),

        initialize: function(options) {
            var self = this,
                parentElt = options.appendTo || $('body');
                
            TEMPLATE_URL = options.templateUrl || TEMPLATE_URL;
            
            parentElt.template(TEMPLATE_URL + '/templates/discover.html', {}, function() {
                self.Projects.bind('reset', self.addAll, self);
                self.Projects.fetch();
            });       
        },

        addOne: function(todo) {
            var view = new ProjectView({model: todo});
            this.$("#project-list").append(view.render().el);
        },

        addAll: function() {
            this.Projects.each(this.addOne);
        },
    });
    
}());
