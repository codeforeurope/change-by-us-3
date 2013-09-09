require(['ext/jquery', 'ext/underscore', 'ext/backbone', 'template', 'projectlist'], function() {
    $(document).ready(function() {
        window.App = new ProjectList({ appendTo: $('body') });
    });
});