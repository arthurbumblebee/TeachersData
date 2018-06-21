// https://learn.cloudcannon.com/jekyll/introduction-to-data-files/
// https://plot.ly

var current_csv;
// automate default dates, max and min dates
$(function () {
    $("#selectLocation").change(function () {
        $.ajax({
            url: "data/" + $("#selectLocation").val() + ".csv",
            dataType: "text",
            success: function (data) {
                current_csv = csv_to_JSON(data);
                console.log("begin at : ", current_csv[0].date_time);
                console.log("end at : ", current_csv[current_csv.length - 2].date_time);
                chooseDate(current_csv[0].date_time, current_csv[current_csv.length - 2].date_time);
            }
        })
    })
        .change();
});

// choosing dates: logic
function chooseDate(min_date, max_date) {
    // http://momentjs.com/docs/#/displaying/format/ - to see formats
    $('#start_date').datetimepicker({
        ignoreReadonly: true,
        // maxDate: max_date, 
        minDate: min_date,
        defaultDate: min_date
    });
    $('#end_date').datetimepicker({
        useCurrent: false,
        ignoreReadonly: true,
        minDate: min_date,
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
        $('#graph_area').css("visibility","visible");
        process_input(current_csv);
    });
});

// process the given input from the client
function process_input(data) {
    var start = moment($("#start_date").val(), 'MM/DD/YYYY hh:mm a').format('M/D/YYYY h:mm');
    var end = moment($("#end_date").val(), 'MM/DD/YYYY hh:mm a').format('M/D/YYYY h:mm');
    var element = $("input[name='selectElement']:checked").val();
    // console.log("value in ", $("#start_date").val());
    // console.log("raw", data[0].date_time);
    // console.log("proc", start);
    // console.log("eleme", element);

    for (var index = 0; index < data.length; index++) {
        if (data[index].date_time == start) {
            var start_id = data[index]["#"];
        }
        if (data[index].date_time == end) {
            var end_id = data[index]["#"];
        }
    }
    console.log("start: ", start_id, " end: ", end_id);
    generate_data_to_plot(data, start_id, end_id, element);

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
    var plot_data = [];
    for (var index = start_id - 1; index < end_id; index++) {
        var data_point = []
        data_point.push(parseInt(raw_data[index]["#"], 10), parseFloat(raw_data[index][element], 10));
        plot_data.push(data_point);
    }
    // console.log(plot_data);
    generate_plot(plot_data, element);

}

// plot the data
function generate_plot(plot_data, element) {
    // console.log("plot", plot_data);
    var options = {
        series: {
            lines: { show: true },
            points: { show: true }
        },
        grid: {
            clickable: true,
            hoverable: true
        }
    };
    var plot = $.plot("#graph_placeholder", [{
        label: element,
        data: plot_data
    }], options);
}

// hoverable handler
// $("#graph_placeholder").bind("plothover", function (event, pos, item) {
//     console.log("hovered");
//     alert("You clicked at " + pos.x + ", " + pos.y);
//     // axis coordinates for other axes, if present, are in pos.x2, pos.x3, ...
//     // if you need global screen coordinates, they are pos.pageX, pos.pageY

//     if (item) {
//         highlight(item.series, item.datapoint);
//         alert("You clicked a point!");
//     }
// });

$(function () {
    $("<div id='tooltip'></div>").css({
        position: "absolute",
        display: "none",
        border: "1px solid #fdd",
        padding: "2px",
        "background-color": "#fee",
        opacity: 0.80
    }).appendTo("body");

    $("#graph_placeholder").bind("plothover", function (event, pos, item) {
        if (item) {
            var x = item.datapoint[0].toFixed(2),
                y = item.datapoint[1].toFixed(2);

            $("#tooltip").html(item.series.label + " at " + x + " = " + y)
                .css({ top: item.pageY + 5, left: item.pageX + 5 })
                .fadeIn(200);
        } else {
            $("#tooltip").hide();
        }
    });
});