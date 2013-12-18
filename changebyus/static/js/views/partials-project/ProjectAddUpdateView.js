define(["underscore", "backbone", "jquery", "template", "abstract-view", "views/partials-project/ProjectSubView", "views/partials-universal/WysiwygFormView", "views/partials-universal/UpdateListItemView", "views/partials-project/ProjectUpdateSuccessModalView"], function(_, Backbone, $, temp, AbstractView, ProjectSubView, WysiwygFormView, UpdateListItemView, ProjectUpdateSuccessModalView) {
  var ProjectAddUpdateView;
  return ProjectAddUpdateView = ProjectSubView.extend({
    parent: "#project-update",
    events: {
      "click #post-update": "animateUp",
      "click .share-toggle": "shareToggle",
      "click .share-options .styledCheckbox": "shareOption"
    },
    shareToggle: function() {
      return $(".share-options").toggleClass("hide");
    },
    shareOption: function(e) {
      /*
      				$input  = $(e.currentTarget).find('input')
      				id      = $input.attr('id')
      				checked = ($input.is(':checked'))
      */

      var checked;
      checked = [];
      $.each($('.share-options input'), function() {
        var $this, id;
        $this = $(this);
        id = $this.attr('id');
        if ($this.is(':checked')) {
          return checked.push(id);
        }
      });
      $('#social_sharing').val(checked.join());
      return console.log('checked.joined()', checked.join());
      /*
      				$projectPage = $("input[name='social_sharing[0]']")
      				$twitter     = $("input[name='social_sharing[1]']")
      				$facebook    = $("input[name='social_sharing[2]']")
      
      				switch id
      					when 'project-page'
      						if checked then $projectPage.val('project-page') else $projectPage.val('')
      					when 'twitter'
      						if checked then $twitter.val('twitter') else $twitter.val('')
      					when 'facebook'
      						if checked then $facebook.val('facebook') else $facebook.val('')
      */

    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      this.viewData.image_url_round_small = $('.profile-nav-header img').attr('src');
      return this.$el.template(this.templateDir + "/templates/partials-project/project-add-update.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      var form,
        _this = this;
      ProjectSubView.prototype.onTemplateLoad.call(this);
      this.$ul = this.$el.find('.updates-container ul');
      form = new WysiwygFormView({
        parent: "#update-form"
      });
      return form.on('ON_TEMPLATE_LOAD', function() {
        var $submit;
        $submit = form.$el.find('input[type="submit"]');
        form.beforeSubmit = function(arr_, form_, options_) {
          return $submit.find("input, textarea").attr("disabled", "disabled");
        };
        form.success = function(response_) {
          if (response_.success) {
            return _this.addModal(response_.data);
          }
        };
        return _this.$el.find('input:radio, input:checkbox').screwDefaultButtons({
          image: 'url("/static/img/black-check.png")',
          width: 18,
          height: 18
        });
      });
    },
    addAll: function() {
      var _this = this;
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-universal/entries-day-wrapper.html", {}, function() {
        var m, model_;
        if (_this.collection.length > 0) {
          model_ = _this.collection.models[0];
          m = moment(model_.get("created_at")).format("MMMM D");
          _this.newDay(m);
        }
        _this.isDataLoaded = true;
        ProjectSubView.prototype.addAll.call(_this);
        return onPageElementsLoad();
      });
    },
    newDay: function(date_) {
      this.currentDate = date_;
      this.$currentDay = this.$day.clone();
      this.$el.append(this.$currentDay);
      this.$currentDay.find('h4').html(date_);
      return this.$ul = this.$currentDay.find('.bordered-item');
    },
    addOne: function(model_) {
      var m, view;
      m = moment(model_.get("created_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      view = new UpdateListItemView({
        model: model_
      });
      return this.$ul.append(view.$el);
    },
    addModal: function(data_) {
      return this.modal = new ProjectUpdateSuccessModalView({
        model: data_
      });
    },
    animateUp: function() {
      return $("html, body").animate({
        scrollTop: 0
      }, "slow");
    }
  });
});
