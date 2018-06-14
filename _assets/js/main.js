$(function () {
    $("#datepicker").click(function () {
        $("#datepicker").hide();
        // datepicker();
    })
});

$(function pickDate() {
    var date_input = $('input[name="date"]');
    var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";
    var options = {
        format: 'mm/dd/yyyy',
        container: container,
        todayHighlight: true,
        autoclose: true,
    };
    // date_input.datepicker(options);

    $('#start_date').datetimepicker();
    $('#end_date').datetimepicker({
        useCurrent: false //Important! See issue #1075

    });
    $("#start_date").on("dp.change", function (e) {
        $('#end_date').data("DateTimePicker").minDate(e.date);
        $('#end_date').data("DateTimePicker").minDate
    });
    $("#end_date").on("dp.change", function (e) {
        $('#start_date').data("DateTimePicker").maxDate(e.date);
    });

    // $("#start_date").datepicker(options);
    // $("#end_date").datepicker(options);
})

$(function () {
    $('#datetimepicker6').datetimepicker();
    $('#datetimepicker7').datetimepicker({
        useCurrent: false //Important! See issue #1075
    });
    $("#datetimepicker6").on("dp.change", function (e) {
        $('#datetimepicker7').data("DateTimePicker").minDate(e.date);
    });
    $("#datetimepicker7").on("dp.change", function (e) {
        $('#datetimepicker6').data("DateTimePicker").maxDate(e.date);
    });
});