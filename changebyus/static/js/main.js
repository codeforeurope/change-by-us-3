require.config({
    baseUrl: "/static/js",
    paths: {
        "jquery":     "ext/jquery/jquery", 
        "underscore": "ext/underscore/underscore-min",
        "backbone":   "ext/backbone/backbone-min", 
        "bootstrap":  "ext/bootstrap/bootstrap",
        "template":   "ext/jquery/template",
        "main":       "views/CBUMainView",
        "discover":   "views/CBUDiscoverView"
    }
});

require(["jquery","main", "discover","collection/ProjectListCollection"], function($, CBUMainView, CBUDiscoverView) {
    $(document).ready(function() {

        var path = window.location.pathname;

        if (path.indexOf('/discover')>-1){
            window.CBUAppView = new CBUDiscoverView({ parent:'#frame' });
        } else {
            window.CBUAppView = new CBUMainView({ parent:'#frame' });
        }
       
    });
});