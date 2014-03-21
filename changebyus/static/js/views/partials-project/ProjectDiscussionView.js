define(["underscore", "backbone", "jquery", "template", "model/ProjectDiscussionModel", "abstract-view", "project-sub-view", "views/partials-universal/WysiwygFormView", "views/partials-project/ProjectDiscussionThreadItemView"], function(_, Backbone, $, temp, ProjectDiscussionModel, AbstractView, ProjectSubView, WysiwygFormView, ProjectDiscussionThreadItemView) {
  var ProjectDiscussionView;
  return ProjectDiscussionView = ProjectSubView.extend({
    $ul: null,
    $form: null,
    discussionsCollection: null,
    $threadFormID: "#add-thread-form",
    parent: "#project-discussion",
    wysiwygFormView: null,
    delayedDataLoad: false,
    count: 0,
    initialize: function(options_) {
      return ProjectSubView.prototype.initialize.call(this, options_);
    },
    render: function() {
      var _this = this;
      this.$el = $(this.parent);
      return this.$el.template(this.templateDir + "partials-project/project-discussion.html", {
        data: this.viewData
      }, function() {
        return _this.onTemplateLoad();
      });
    },
    onTemplateLoad: function() {
      this.$form = this.$el.find(this.$threadFormID);
      return this.loadDayTemplate();
    },
    onDayWrapperLoad: function() {
      if (this.delayedDataLoad) {
        this.onSuccess();
      }
      return AbstractView.prototype.onTemplateLoad.call(this);
    },
    addAll: function() {
      var model, response, _i, _len, _ref, _results;
      this.$el.find('.day-wrapper').remove();
      this.currentDate = '';
      _ref = this.model.get("responses");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        response = _ref[_i];
        model = new ProjectDiscussionModel(response);
        _results.push(this.addOne(model));
      }
      return _results;
    },
    addOne: function(model_) {
      var m, projectDiscussionThreadItemView;
      m = moment(model_.get("created_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      projectDiscussionThreadItemView = new ProjectDiscussionThreadItemView({
        model: model_
      });
      this.$ul.append(projectDiscussionThreadItemView.$el);
      return onPageElementsLoad();
    },
    updateDiscussion: function(id_) {
      var _this = this;
      this.model = new ProjectDiscussionModel({
        id: id_
      });
      return this.model.fetch({
        success: function() {
          _this.isDataLoaded = true;
          if (_this.templateLoaded === false) {
            return _this.delayedDataLoad = true;
          } else {
            return _this.onSuccess();
          }
        }
      });
    },
    updateCount: function(count) {
      var title;
      this.count = count;
      title = this.model != null ? this.model.get("title") : "";
      this.$el.find(".admin-title").text("All Discussions (" + this.count + "):   ");
      return this.$el.find(".discussion-title").text(title);
    },
    onSuccess: function() {
      var dataObj, userAvatar, userName,
        _this = this;
      this.addAll();
      this.$form.html('').detach().appendTo(this.$el);
      this.updateCount(this.count);
      userAvatar = $('.profile-nav-header img').attr('src');
      userName = $('.profile-nav-header span').text();
      dataObj = {
        parent: this.$threadFormID,
        id: this.model.get("id"),
        slim: true,
        userAvatar: userAvatar,
        userName: userName,
        title: this.model.get("title")
      };
      this.wysiwygFormView = new WysiwygFormView(dataObj);
      return this.wysiwygFormView.success = function(e) {
        var model;
        if (e.success) {
          $("#new-thread-editor").html("");
          model = new ProjectDiscussionModel(e.data);
          return _this.addOne(model);
        }
      };
    }
  });
});
