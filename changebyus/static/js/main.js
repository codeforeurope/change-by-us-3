require.config({
    baseUrl: "/static/js",
    paths: {
        "jquery": "ext/jquery/jquery", 
        "underscore": "ext/underscore/underscore-min",
        "backbone": "ext/backbone/backbone-min", 
        "bootstrap": "ext/bootstrap/bootstrap",
        "template": "ext/jquery/template",
        "app":  "views/CBUAppView"
    }
});

require(["jquery","app", "collection/ProjectListCollection"], function($, CBUAppView, ProjectListCollection) {
    $(document).ready(function() {
        var projects = new ProjectListCollection();
        window.CBUAppView = new CBUAppView({ parent:'#frame', collection:projects });
    });
});