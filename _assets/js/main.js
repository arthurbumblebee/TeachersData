// ---
// ---

// map reading - https://learn.cloudcannon.com/jekyll/introduction-to-data-files/
// flot api - https://github.com/flot/flot/blob/master/API.md#time-series-data
// flot toggling - http://www.jqueryflottutorial.com/jquery-flot-toggling-series-manipulation.html
// https://plot.ly
// ajax jekyll tutorial - http://frontendcollisionblog.com/javascript/jekyll/tutorial/2015/03/26/getting-started-with-a-search-engine-for-your-site-no-server-required.html

var current_csv;

// automate default dates, max and min dates
$(function () {
    $("#selectLocation").change(function () {
        $.ajax({
            // url: "{{ site.baseurl}}/{{ site.data }}/" + $("#selectLocation").val() + ".csv",
            url: "data/recordedData/" + $("#selectLocation").val() + ".csv",
            dataType: "text",
            success: function (data) {
                // console.log(data);
                current_csv = csv_to_JSON(data);
                // console.log(current_csv);
                // console.log("begin at : ", current_csv[0].date_time, "end at : ", current_csv[current_csv.length - 2].date_time);
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
        useCurrent: false,
        ignoreReadonly: true,
        minDate: min_date,
        maxDate: max_date,
        defaultDate: min_date
    });
    $('#end_date').datetimepicker({
        useCurrent: false,
        ignoreReadonly: true,
        minDate: min_date,
        maxDate: max_date,
        defaultDate: max_date
    });

    $("#start_date").val(min_date);
    $("#end_date").val(max_date);

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
        // console.log("file : ", current_csv);
        process_input(current_csv);
    });
});

// process the given input from the client
function process_input(data) {
    var start = moment($("#start_date").val(), 'MM/DD/YYYY hh:mm a').format('M/D/YYYY H:mm');
    var end = moment($("#end_date").val(), 'MM/DD/YYYY hh:mm a').format('M/D/YYYY H:mm');
    var elements = $("input[type='checkbox']:checked").map(function () {
        return $(this).val();
    }).get();
    generate_range(data, start, end, elements);
}

function generate_range(data, start, end, elements) {
    for (var index = 0; index < data.length; index++) {
        if (data[index].date_time == start) {
            var start_id = data[index]["#"];
        }
        if (data[index].date_time == end) {
            var end_id = data[index]["#"];
        }
    }
    generate_data_to_plot(data, start_id, end_id, elements);
}

// convert csv to json...var csv is the CSV file with headers
function csv_to_JSON(csv) {
    var lines = csv.split("\n");
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
function generate_data_to_plot(raw_data, start_id, end_id, elements) {
    var plot_data = [];
    var dateParts, date, timestamp, element_index, index;
    element_index = 0;
    // console.log("file : ", raw_data);
    for (element_index = 0; element_index < elements.length; element_index++) {
        var element_plot_data = [];
        for (index = start_id - 1; index < end_id; index++) {
            var data_point = [];
            dateParts = raw_data[index]["date_time"].match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/);
            date = new Date(dateParts[3], dateParts[1] - 1, dateParts[2], dateParts[4], dateParts[5]);
            timestamp = date.getTime() * 1;
            data_point.push(timestamp, parseFloat(raw_data[index][elements[element_index]], 10));
            element_plot_data.push(data_point);
        }
        plot_data.push(element_plot_data);
    }
    // console.log("elements : ", elements[element_index], elements.length);
    console.log("plot data : ", plot_data);
    generate_plot(plot_data, elements);

}

// plot the data
function generate_plot(plot_data, elements) {
    var data = [
        { label: elements[0], data: plot_data[0] },
        { label: elements[1], data: plot_data[1], yaxis: 2 }
    ];
    var options = {
        series: {
            lines: { show: true },
            points: { show: false }
        },
        xaxis: {
            mode: "time",
            timezone: "browser",
            // tickSize: [1, "month"],
            // tickLength: 0,
            axisLabel: "Time",
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana',
            axisLabelPadding: 10
        },
        yaxes: [
            {
                axisLabel: elements[0],
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana',
                axisLabelPadding: 10
            }, {
                position: "right",
                axisLabel: elements[1],
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana',
                axisLabelPadding: 10
            }
        ],
        legend: {
            noColumns: 1,
            labelBoxBorderColor: "white",
            position: "ne"
        },
        grid: {
            hoverable: true,
            clickable: true,
            borderWidth: 2,
            borderColor: "rgb(150, 85, 167)",
            backgroundColor: { colors: ["white", "rgb(228, 236, 247)"] }
        },
        colors: ["rgb(238, 178, 50)", "rgb(50, 216, 238)"]
    };

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

function showTooltip(x, y, color, contents) {
    $('<div id="tooltip">' + contents + '</div>').css({
        top: y - 50,
        left: x - 70,
        border: '2px solid ' + color,
    }).appendTo("body").fadeIn(200);
}

$(function () {
    $.ajax({
        url: "data/locations/locations.csv",
        dataType: "text",
        success: function (data) {
            var markers = csv_to_JSON(data);
            console.log("locations : ", markers);
            initMap(markers);
        }
    })
});

function initMap(markers) {
    var bounds = new google.maps.LatLngBounds();
    var mapDiv = document.getElementById('map');
    var map = new google.maps.Map(mapDiv, { zoom: 8 });

    for (var i = 0; i < markers.length; i++) {
        var position = new google.maps.LatLng(markers[i].latitude, markers[i].longitude);
        bounds.extend(position);
        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i].title
        });
        marker.addListener('click', function (event, item) {
            console.log("location clicked", item);
            locationClicked(event, item);
        });
    }
    // Automatically center the map fitting all markers on the screen
    map.fitBounds(bounds);

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function (event) {
        this.setZoom(5);
        google.maps.event.removeListener(boundsListener);
    });
};

function locationClicked(event, item){
    console.log("location clicked", event);
}