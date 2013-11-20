define(["underscore", "backbone"], function(_, Backbone) {
  var UserModel;
  return UserModel = Backbone.Model.extend({
    urlRoot: "/api/user/",
    defaults: {
      last_name: "",
      updated_at: "2000-01-01 00:00:00.000000",
      notifications: {
        responds_to_a_discussion: true,
        posts_discussion: true,
        joins_my_project: true,
        responds_to_my_comment: true,
        responds_to_my_update: true,
        joins_common_project: false,
        flags_me: true,
        posts_update_common_project: false,
        posts_update_to_my_project: true
      },
      active: false,
      password: "",
      id: "",
      public_email: false,
      first_name: "",
      display_name: "",
      roles: [],
      created_at: "2000-01-01 00:00:00.000000"
    },
    parse: function(resp_) {
      if (resp_.data) {
        return resp_.data;
      } else {
        return resp_;
      }
    }
  });
});
