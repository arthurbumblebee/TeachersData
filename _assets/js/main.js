$( function() {
    $( "#datepicker" ).click(function(){
        $( "#datepicker" ).hide();
        // datepicker();
    }) 
} );

$( function pickDate(){
    var date_input=$('input[name="start_date"]');
    var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
    var options={
        format: 'mm/dd/yyyy',
        container: container,
        todayHighlight: true,
        autoclose: true,
    };
    date_input.datepicker(options);
    $("#start_date").datepicker(options);
    $("#end_date").datepicker(options);
})