// choose dates
$(function chooseDate() {
    // http://momentjs.com/docs/#/displaying/format/ - to see formats
    $('#start_date').datetimepicker({
        format: 'L',
        ignoreReadonly: true
    });
    $('#end_date').datetimepicker({
        useCurrent: false,
        format: 'L',
        ignoreReadonly: true
    });
    // disable choosing invalid dates
    $("#start_date").on("dp.change", function (e) {
        $('#end_date').data("DateTimePicker").minDate(e.date);
    });
    $("#end_date").on("dp.change", function (e) {
        $('#start_date').data("DateTimePicker").maxDate(e.date);
    });
})
