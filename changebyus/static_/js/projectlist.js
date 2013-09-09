(function() {
    var TEMPLATE_URL = '/static';
    
    var Project = Backbone.Model.extend({

        defaults: function() {
            return {
                title: '',
                description: '',
                done:  false,
                order: 0
            };
        },

        toggle: function() {
            this.save({done: !this.get("done")});
        }

    });

    var ProjectList = Backbone.Collection.extend({

        model: Project,
        
        url: '/Projects/',

        done: function() {
            return this.filter(function(todo) { return todo.get('done'); });
        },

        remaining: function() {
            return this.without.apply(this, this.done());
        },
        
        nextOrder: function() {
            if (!this.length) { 
                return 1; 
            }
            
            return this.last().get('order') + 1;
        },

        comparator: function(todo) {
            return todo.get('order');
        }

    });

    var TodoView = Backbone.View.extend({         

        tagName:  "li",

        events: {
            "click .check"              : "toggleDone",
            "dblclick div.todo-text"    : "edit",
            "click span.todo-destroy"   : "clear",
            "keypress .todo-input"      : "updateOnEnter"
        },

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },

        render: function() {
            var self = this;
            
            $(self.el).template(TEMPLATE_URL + '/templates/item.html', self.model.toJSON(), function() {
                self.setText();
            });
            
            return this;
        },

        setText: function() {
            var text = this.model.get('text');
            this.$('.todo-text').text(text);
            this.input = this.$('.todo-input');
            this.input.bind('blur', _.bind(this.close, this)).val(text);
        },

        toggleDone: function() {
            this.model.toggle();
        },

        edit: function() {
            $(this.el).addClass("editing");
            this.input.focus();
        },

        close: function() {
            this.model.save({text: this.input.val()});
            $(this.el).removeClass("editing");
        },

        updateOnEnter: function(e) {
            if (e.keyCode === 13) { this.close(); }
        },

        remove: function() {
            $(this.el).remove();
        },

        clear: function() {
            this.model.destroy();
        }

    });

    window.MyAppName = Backbone.View.extend({
        
        Projects: new ProjectList(),

        events: {
            "keypress #new-todo":  "createOnEnter",
            "click .todo-clear a": "clearCompleted"
        },

        initialize: function(options) {
            var self = this,
                parentElt = options.appendTo || $('body');
                
            TEMPLATE_URL = options.templateUrl || TEMPLATE_URL;
            
            parentElt.template(TEMPLATE_URL + '/templates/app.html', {}, function() {
                self.el = $('#body-container');
                self.delegateEvents();
                
                self.input = self.$("#new-todo");

                self.Projects.bind('add',   self.addOne, self);
                self.Projects.bind('reset', self.addAll, self);
                self.Projects.bind('all',   self.render, self);

                self.Projects.fetch();
            });
        },

        render: function() {
            var self = this,
                data = {
                    total:      self.Projects.length,
                    done:       self.Projects.done().length,
                    remaining:  self.Projects.remaining().length
                };
            
            $('#todo-stats').template(TEMPLATE_URL + '/templates/stats.html', data);
            
            return this;
        },

        addOne: function(todo) {
            var view = new TodoView({model: todo});
            this.$("#todo-list").append(view.render().el);
        },

        addAll: function() {
            this.Projects.each(this.addOne);
        },

        createOnEnter: function(e) {
            var text = this.input.val();
            
            if (!text || e.keyCode !== 13) {
                return;
            }
            
            this.Projects.create({text: text, order: this.Projects.nextOrder()});
            this.input.val('');
        },

        clearCompleted: function() {
            _.each(this.Projects.done(), function(todo) { todo.destroy(); });
            return false;
        }
        
    });
    
}());