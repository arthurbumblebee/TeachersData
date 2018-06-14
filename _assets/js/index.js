$( function() {
    $( "#datepicker" ).datepicker();
} );

$( function pickStart(){
    var date_input=$('input[name="start_date"]');
    var options={
        format: 'mm/dd/yyyy',
        container: container,
        todayHighlight: true,
        autoclose: true,
    };
    // date_input.datepicker(options);
    $("#start_date").datepicker(options);
})