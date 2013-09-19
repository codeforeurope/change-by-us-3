require.config({
    baseUrl: "/static/js",
    paths: {
        "jquery":           "ext/jquery/jquery", 
        "hotkeys":          "ext/jquery/jquery.hotkeys", 
        "underscore":       "ext/underscore/underscore-min",
        "backbone":         "ext/backbone/backbone-min", 
        "bootstrap":        "ext/bootstrap/bootstrap.min",
        "wysiwyg":          "ext/bootstrap/bootstrap-wysiwyg",
        "prettify":         "ext/google/prettify",
        "template":         "ext/jquery/template",
        "form":             "ext/jquery/jquery.form.min",
        "main-view":        "views/CBUMainView",
        "discover-view":    "views/CBUDiscoverView", 
        "project-view":     "views/CBUProjectView",
        "login-view":       "views/CBULoginView",
        "signup-view":      "views/CBUSignupView",
        "create-view":      "views/partials-universal/CreateProjectView",
        "abstract-view":    "views/partials-universal/AbstractView",
        "project-sub-view": "views/partials-project/ProjectSubView"
    }
});

require(["jquery","main-view", "discover-view","create-view","project-view","login-view","signup-view"], 
    function($, CBUMainView, CBUDiscoverView, CreateProjectView, CBUProjectView, CBULoginView, CBUSignupView) {
        $(document).ready(function() {

            var path = window.location.pathname,
                config = { parent:'#frame' };

            if (path.indexOf('/discover')>-1){
                window.CBUAppView = new CBUDiscoverView(config);
            } else if (path.indexOf('/create')>-1){
                window.CBUAppView = new CreateProjectView(config);
            } else if (path.indexOf('/login')>-1){
                window.CBUAppView = new CBULoginView(config);
            } else if (path.indexOf('/signup')>-1){
                window.CBUAppView = new CBUSignupView(config);
            } else if (path.indexOf('/project')>-1){
                config.model = {id:window.projectID};
                window.CBUAppView = new CBUProjectView(config);
            } else {
                window.CBUAppView = new CBUMainView(config);
            }
        });
});