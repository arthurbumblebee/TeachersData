// automate default dates, max and min dates
$(function () {
    $("#selectLocation").change(function () {
        $.ajax({
            url: "data/" + $("#selectLocation").val() + ".csv",
            dataType: "text",
            success: function (data) {
                var current_csv = csv_to_JSON(data);
                console.log("begin at : ", current_csv[0].date_time);
                console.log("end at : ", current_csv[current_csv.length - 2].date_time);
                chooseDate(current_csv[0].date_time, current_csv[current_csv.length - 2].date_time);
            }
        })
    })
        .change();
});

// choose dates logic
function chooseDate(min_date, max_date) {
    // http://momentjs.com/docs/#/displaying/format/ - to see formats
    $('#start_date').datetimepicker({
        ignoreReadonly: true,
        minDate: min_date,
        defaultDate: min_date
        
    });
    $('#end_date').datetimepicker({
        useCurrent: false,
        ignoreReadonly: true,
        maxDate: max_date,
        defaultDate: max_date
    });
    // disable choosing invalid dates
    $("#start_date").on("dp.change", function (e) {
        $('#end_date').data("DateTimePicker").minDate(e.date);
    });
    $("#end_date").on("dp.change", function (e) {
        $('#start_date').data("DateTimePicker").maxDate(e.date);
    });
}

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
            process_input(data);
        }
    })
}
// process the given input from the client
function process_input(data) {
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
        if (raw_data[index].date_time == end) {
            var end_id = raw_data[index]["#"];
        }
    }
    console.log("start: ", start_id, " end: ", end_id);
    generate_data_to_plot(raw_data, start_id, end_id, element);

}

// convert csv to json...var csv is the CSV file with headers
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

// generate the data to plot
function generate_data_to_plot(raw_data, start_id, end_id, element) {
    var plot_data = [[]];
    for (var index = start_id - 1; index < end_id; index++) {
        var data_point = []
        data_point.push(parseInt(raw_data[index]["#"], 10), parseFloat(raw_data[index][element], 10));
        plot_data[0].push(data_point);
    }
    // console.log(plot_data);
    generate_plot(plot_data);

}

// plot the data
function generate_plot(plot_data) {
    var options = {
        series: {
            lines: { show: true },
            points: { show: true, fill: false }
        }
    };
    var plot = $("#graph1").plot(plot_data, options).data("plot");
}


// https://learn.cloudcannon.com/jekyll/introduction-to-data-files/

