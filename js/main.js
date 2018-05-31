/* Stylesheet by J Carney, 2018 */

function initialize() {
    myfunc();
    jQueryAjax();
    console.log("dog says woof");
};

function myfunc() {
    //var mydiv = document.getElementById("mydiv");
    //mydiv.innerHTML = "Hello world via script!";
    $("#mydiv").html("HELLO WORLD FROM JQUERY!");
};

function jQueryAjax() {
    $.ajax("data/test.csv",{
        dataType: "text",
        success: callback
    });
};

function callback(response){
    console.log(response);
    var testData = response;

}

$(document).ready(initialize);