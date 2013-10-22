define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectSubView", "views/partials-project/ProjectWysiwygFormView", "views/partials-project/ProjectUpdateListItemView", "views/partials-project/ProjectUpdateSuccessModalView"], function(_, Backbone, $, temp, AbstractView, ProjectSubView, ProjectWysiwygFormView, ProjectUpdateListItemView, ProjectUpdateSuccessModalView) {
  var ProjectAddUpdateView;
  return ProjectAddUpdateView = ProjectSubView.extend({
    parent: "#project-update",
    initialize: function(options) {
      ProjectSubView.prototype.initialize.call(this, options);
      return this.render();
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-add-update.html", {
        data: this.viewData
      }, function() {
        var $shareOptions, $shareToggle, $submit, form;
        _this.$ul = _this.$el.find('.updates-container ul');
        form = new ProjectWysiwygFormView({
          parent: "#update-form"
        });
        $submit = form.$el.find('input[type="submit"]');
        console.log('$submit', $submit, form.$el);
        form.beforeSubmit = function(arr_, form_, options_) {
          var share;
          $submit.attr("disabled", "disabled");
          share = [];
          if ($("#twitter").val() === "on") {
            share.push('twitter');
          }
          if ($("#facebook").val() === "on") {
            share.push('facebook');
          }
          return arr_.push({
            name: "social_sharing",
            value: share,
            type: "hidden",
            required: false
          });
        };
        form.success = function(response_) {
          _this.addModal(response_.data);
          return console.log('response_', response_);
        };
        $shareOptions = $(".share-options");
        $shareToggle = $(".share-toggle");
        return $shareToggle.click(function() {
          return $shareOptions.toggleClass("hide");
        });
      });
    },
    noResults: function() {},
    addOne: function(model_) {
      var view;
      console.log("ProjectAddUpdateView addOne model", model_);
      view = new ProjectUpdateListItemView({
        model: model_
      });
      return this.$ul.append(view.render().$el);
    },
    addModal: function(data_) {
      return this.modal = new ProjectUpdateSuccessModalView(data_);
    }
  });
});
