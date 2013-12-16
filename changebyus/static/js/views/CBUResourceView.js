define(["underscore", "backbone", "jquery", "template", "abstract-view", "model/ResourceModel", "collection/ResourceUpdatesCollection"], function(_, Backbone, $, temp, AbstractView, ResourceModel, ResourceUpdatesCollection) {
  var CBUProjectView;
  return CBUProjectView = AbstractView.extend({
    isMember: false,
    $header: null,
    initialize: function(options) {
      var _this = this;
      this.templateDir = options.templateDir || this.templateDir;
      this.parent = options.parent || this.parent;
      this.model = new ResourceModel(options.model);
      this.collection = options.collection || this.collection;
      return this.model.fetch({
        success: function() {
          return _this.render();
        }
      });
    },
    events: {
      "click .resource-footer .btn": "followResource"
    },
    render: function() {
      var _this = this;
      this.$el = $("<div class='resource-container'/>");
      this.$el.template(this.templateDir + "/templates/resource.html", {}, function() {
        return _this.onTemplateLoad();
      });
      return $(this.parent).append(this.$el);
    },
    onTemplateLoad: function() {
      var id,
        _this = this;
      this.viewData = this.model.attributes;
      if (window.userID === "") {
        this.isMember = false;
        return this.addHeaderView();
      } else {
        id = this.model.get("id");
        return $.ajax({
          type: "GET",
          url: "/api/resource/" + id + "/user/" + window.userID
        }).done(function(response) {
          if (response.success) {
            _this.memberData = response.data;
            _this.isMember = true === _this.memberData.member || true === _this.memberData.organizer || true === _this.memberData.owner ? true : false;
            _this.viewData.isMember = _this.isMember;
            return _this.addHeaderView();
          }
        });
      }
    },
    addHeaderView: function() {
      var _this = this;
      this.$header = $("<div class='project-header'/>");
      return this.$header.template(this.templateDir + "/templates/partials-resource/resource-header.html", {
        data: this.viewData
      }, function() {
        return _this.onHeaderLoaded();
      });
    },
    onHeaderLoaded: function() {
      var config, id;
      id = this.model.get("id");
      config = {
        id: id
      };
      this.$el.prepend(this.$header);
      this.resourceUpdatesCollection = new ResourceUpdatesCollection(config);
      this.resourceUpdatesCollection.on("reset", this.onCollectionLoad, this);
      return this.resourceUpdatesCollection.fetch({
        reset: true
      });
    },
    onCollectionLoad: function() {
      this.addAll();
      return this.delegateEvents();
    },
    addAll: function() {
      var _this = this;
      if (this.collection.models.length === 0) {
        return this.$el.template(this.templateDir + "/templates/partials-project/project-zero-discussions.html", {}, function() {
          return onPageElementsLoad();
        });
      } else {
        return this.loadDayTemplate();
      }
    },
    loadDayTemplate: function() {
      var _this = this;
      this.$day = $('<div />');
      return this.$day.template(this.templateDir + "/templates/partials-project/project-entries-day-wrapper.html", {}, function() {
        var m, model_;
        if (_this.collection.length > 0) {
          model_ = _this.collection.models[0];
          m = moment(model_.get("updated_at")).format("MMMM D");
          _this.newDay(m);
        }
        _this.isDataLoaded = true;
        return ProjectSubView.prototype.addAll.call(_this);
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
      var config, m, projectDiscussionListItemView,
        _this = this;
      m = moment(model_.get("updated_at")).format("MMMM D");
      if (this.currentDate !== m) {
        this.newDay(m);
      }
      config = {
        model: model_
      };
      projectDiscussionListItemView = new ProjectDiscussionListItemView(config);
      projectDiscussionListItemView.on('click', function() {
        return _this.trigger('discussionClick', config);
      });
      this.$ul.append(projectDiscussionListItemView.$el);
      return onPageElementsLoad();
    },
    followResource: function(e) {
      var $join, id,
        _this = this;
      if (this.isMember) {
        return;
      }
      if (window.userID === "") {
        return window.location = "/login";
      } else {
        id = this.model.get("id");
        $join = $(".project-footer .btn");
        e.preventDefault();
        return $.ajax({
          type: "POST",
          url: "/api/resource/join",
          data: {
            project_id: id
          }
        }).done(function(response) {
          if (response.success) {
            _this.isMember = true;
            return $join.html('Joined!').css('background-color', '#e6e6e6');
          }
        });
      }
    }
  });
});
