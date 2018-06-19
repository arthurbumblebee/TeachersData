// choose dates
$(function chooseDate() {
    // http://momentjs.com/docs/#/displaying/format/ - to see formats
    $('#start_date').datetimepicker({
        ignoreReadonly: true
    });
    $('#end_date').datetimepicker({
        useCurrent: false,
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

// process data
$(function () {
    $("form").submit(function (e) {
        e.preventDefault();
        displayResults();
    });
});

// helper function to get data points
function displayResults() {
    // alert("location: " + $("#selectLocation").val() + "\n start: "+ $("#start_date").val() + "\n end: "+$("#end_date").val() + "\n opt: "+$("input[name='selectElement']:checked").val());
    $.ajax({
        url: "data/" + $("#selectLocation").val() + ".csv",
        dataType: "text",
        success: function (data) {
            var raw_data = csv_to_JSON(data);
            var start = moment($("#start_date").val(), 'MM/DD/YYYY hh:mm a').format('M/D/YYYY h:mm');
            var end = moment($("#end_date").val(), 'MM/DD/YYYY hh:mm a').format('M/D/YYYY h:mm');
            var element = $("input[name='selectElement']:checked").val();

            // console.log("value in ", $("#start_date").val());
            // console.log("raw", raw_data[0].date_time);
            // console.log("proc", start);
            // console.log("eleme", element);
            for (var index = 0; index < raw_data.length; index++) {
                if (raw_data[index].date_time == start) {
                    var start_id = raw_data[index]["#"];
                }
                else if (raw_data[index].date_time == end) {
                    var end_id = raw_data[index]["#"];
                }
            }
            // console.log("start: ", start_id, " end: ", end_id);
            for (index = start_id - 1; index < end_id; index++) {
                console.log(raw_data[index][element]);
            }
        }
    })
}

// https://learn.cloudcannon.com/jekyll/introduction-to-data-files/

// convert csv to json
// var csv is the CSV file with headers
function csv_to_JSON(csv) {
    var lines = csv.split("\r\n");
    var result = [];
    var headers = lines[0].split(",");
    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(",");
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result;
}