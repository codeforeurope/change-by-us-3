define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectSubView", "views/partials-project/ProjectWysiwygFormView", "views/partials-project/ProjectUpdateListItemView", "views/partials-project/ProjectUpdateSuccessModalView"], function(_, Backbone, $, temp, AbstractView, ProjectSubView, ProjectWysiwygFormView, ProjectUpdateListItemView, ProjectUpdateSuccessModalView) {
  var ProjectAddUpdateView;
  return ProjectAddUpdateView = ProjectSubView.extend({
    parent: "#project-update",
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "/templates/partials-project/project-add-update.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var $shareOptions, $shareToggle, $submit, form,
        _this = this;
      ProjectSubView.prototype.onTemplateLoad.call(this);
      $("#post-update").click(function() {
        return $("html, body").animate({
          scrollTop: 0
        }, "slow");
      });
      this.$ul = this.$el.find('.updates-container ul');
      form = new ProjectWysiwygFormView({
        parent: "#update-form"
      });
      $submit = form.$el.find('input[type="submit"]');
      form.beforeSubmit = function(arr_, form_, options_) {
        var share;
        $submit.find("input, textarea").attr("disabled", "disabled");
        share = [];
        if ($("#twitter").prop('checked')) {
          share.push('twitter');
        }
        if ($("#facebook").prop('checked')) {
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
        if (response_.success) {
          _this.addModal(response_.data);
        }
        return console.log('response_', response_);
      };
      $shareOptions = $(".share-options");
      $shareToggle = $(".share-toggle");
      $shareToggle.click(function() {
        return $shareOptions.toggleClass("hide");
      });
      return $('input:radio, input:checkbox').screwDefaultButtons({
        image: 'url("/static/img/black-check.png")',
        width: 18,
        height: 18
      });
    },
    addAll: function() {
      var _this = this;
      console.log('addAlladdAlladdAlladdAlladdAlladdAlladdAlladdAll');
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-project/project-entries-day-wrapper.html", {}, function() {
        var m, model_;
        if (_this.collection.length > 0) {
          model_ = _this.collection.models[0];
          m = moment(model_.attributes.updated_at).format("MMMM D");
          _this.newDay(m);
        }
        _this.isDataLoaded = true;
        ProjectSubView.prototype.addAll.call(_this);
        return onPageElementsLoad();
      });
    },
    newDay: function(date_) {
      console.log('newDay', date_);
      this.currentData = date_;
      this.$currentDay = this.$day.clone();
      this.$el.append(this.$currentDay);
      this.$currentDay.find('h4').html(date_);
      return this.$ul = this.$currentDay.find('.bordered-item');
    },
    addOne: function(model_) {
      var m, view;
      m = moment(model_.attributes.updated_at).format("MMMM D");
      if (this.currentData !== m) {
        this.newDay(m);
      }
      console.log("ProjectAddUpdateView addOne model", model_);
      view = new ProjectUpdateListItemView({
        model: model_
      });
      return this.$ul.append(view.render().$el);
    },
    addModal: function(data_) {
      console.log("ProjectAddUpdateView addModal model", data_);
      return this.modal = new ProjectUpdateSuccessModalView({
        model: data_
      });
    }
  });
});
