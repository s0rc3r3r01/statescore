//jQuery working here
$(function(){

 //variables declaration

//template that will be loaded
    var template;
// variable containing the json data for the template
    var jsondata = {};  // JSON data object that feeds the template

//page initialization
    var initPage = function() {

//loading the template
        $.get("/templates/index.html", function(param){
            template = param;
        });

//retrieve the json with the server data and write the page
        $.getJSON("/v1/statescore.json", function (param) {
            $.extend(jsondata, param.data);
        });

//when the ajax calls are finished Mustache parses the template
// replacing the variables

        $(document).ajaxStop(function () {
		var renderedPage = Mustache.to_html( template, jsondata );
            $("body").html( renderedPage );
        })
    }();
});
