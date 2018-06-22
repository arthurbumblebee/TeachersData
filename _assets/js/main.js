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
        // minDate: min_date,
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
        $('#graph_area').css("visibility", "visible");
        process_input(current_csv);
    });
});

// process the given input from the client
function process_input(data) {
    var start = moment($("#start_date").val(), 'MM/DD/YYYY hh:mm a').format('M/D/YYYY H:mm');
    var end = moment($("#end_date").val(), 'MM/DD/YYYY hh:mm a').format('M/D/YYYY H:mm');
    var element = $("input[name='selectElement']:checked").val();

    for (var index = 0; index < data.length; index++) {
        if (data[index].date_time == start) {
            var start_id = data[index]["#"];
        }
        if (data[index].date_time == end) {
            var end_id = data[index]["#"];
        }
    }
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
    var dateParts, date, timestamp;
    for (var index = start_id - 1; index < end_id; index++) {
        var data_point = [];
        dateParts = raw_data[index]["date_time"].match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/);
        date = new Date(dateParts[3], dateParts[1] - 1, dateParts[2], dateParts[4], dateParts[5]);
        timestamp = date.getTime() * 1;
        data_point.push(timestamp, parseFloat(raw_data[index][element], 10));
        plot_data.push(data_point);
    }
    // console.log(plot_data);
    generate_plot(plot_data, element);

}

// plot the data
function generate_plot(plot_data, element) {
    var options = {
        series: {
            lines: { show: true },
            points: { show: true }
        },
        grid: {
            clickable: true,
            hoverable: true
        },
        xaxis: {
            mode: "time",
            timezone: "browser",
            // tickSize: [1, "month"],
            // tickLength: 0,
            axisLabel: "Time",
            axisLabelUseCanvas: true,
            // axisLabelFontSizePixels: 12,
            // axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 10
        },
        yaxis: {
            axisLabel: element,
            axisLabelUseCanvas: true,
            // axisLabelFontSizePixels: 12,
            // axisLabelFontFamily: 'Verdana, Arial',
            axisLabelPadding: 10
        }
    };
    var data = [{
        label: element,
        data: plot_data
    }];
    $.plot("#graph_placeholder", data, options);
    $("#graph_placeholder").UseTooltip();
}

var previousPoint = null, previousLabel = null;

$.fn.UseTooltip = function () {
    $(this).bind(("plotclick", "plothover"), function (event, pos, item) {
        if (item) {
            if ((previousLabel != item.series.label) || (previousPoint != item.dataIndex)) {
                previousPoint = item.dataIndex;
                previousLabel = item.series.label;
                $("#tooltip").remove();

                var timestamp = item.datapoint[0];
                var element_data = item.datapoint[1];

                var color = item.series.color;
                var time = new Date(timestamp).toLocaleString();

                if (item.seriesIndex == 0) {
                    showTooltip(item.pageX,
                        item.pageY,
                        color,
                        "<strong>" + item.series.label + "</strong><br>" + time + " : <strong>" + element_data + "</strong>");
                } else {
                    showTooltip(item.pageX,
                        item.pageY,
                        color,
                        "<strong>" + item.series.label + "</strong><br>" + time + " : <strong>" + element_data + "</strong>");
                }
            }
        } else {
            $("#tooltip").remove();
            previousPoint = null;
        }
    });

};
// });

function showTooltip(x, y, color, contents) {
    $('<div id="tooltip">' + contents + '</div>').css({
        top: y - 50,
        left: x - 70,
        border: '2px solid ' + color,
    }).appendTo("body").fadeIn(200);
}