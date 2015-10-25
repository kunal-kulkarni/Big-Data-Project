$(function() {
               $("#startdate").datepicker({ dateFormat: "yy-mm-dd" }).val()
               $("#enddate").datepicker({ dateFormat: "yy-mm-dd" }).val()
});


$(function() {
    $( "#tabs" ).tabs();
     $( "#tabs" ).tabs("select" , 2);
});