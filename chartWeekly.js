var margin = {top: 20, right: 20, bottom: 20, left: 20},
width = 960 - margin.left - margin.right,
height = 320 - margin.top - margin.bottom;

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var parseDate = d3.time.format("%Y-%m-%d %I:%M:%S %p").parse;

var x = d3.time.scale()
.range([0, width]);

var y = d3.scale.linear()
.range([height, 0]);

var xAxis = d3.svg.axis()
.scale(x)
.orient("bottom");

var yAxis = d3.svg.axis()
.scale(y)
.orient("left");

var line = d3.svg.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.bpm); });

var svg = d3.select("#chartWeekly").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var _weekIndex = 0;

function getCurrWeek(weeklyData) {
    var currWeek = [];
    weeklyData[_weekIndex].forEach(function(d) {
        currWeek = currWeek.concat(d);
    });
    return currWeek;
}

d3.csv("sampleData.csv", function(data, error) { 
    var weeklyData = [];
    var dailyData = [[]];
    var currDay = parseDate(data[data.length-1].date).toDateString();
    var numDays = 0;
    
    var i = data.length;
    while(i--) {
        var d = data[i];
        d.date = parseDate(d.date);
        d.bpm = +d.bpm;
        
        if (currDay != d.date.toDateString()) {
            numDays++;
            if (numDays < 7) {
                dailyData[numDays] = [];
            } else {
                weeklyData.push(dailyData.reverse());
                dailyData = [[]];
                numDays = 0;
            }
            currDay = d.date.toDateString();
        }
        dailyData[numDays].push(d);
    }
    weeklyData.push(dailyData.reverse());
    
    var currWeek = getCurrWeek(weeklyData);
    
    //Set date as title
    var lastDay = data[data.length-1].date; //latest day
    var oneWeekAgo = new Date(lastDay.getTime() - 1000 * 60 * 60 * 24 * 7);
    var title = monthNames[oneWeekAgo.getMonth()] + " " + oneWeekAgo.getDate() + " - ";
    if (lastDay.getMonth() != oneWeekAgo.getMonth()) {
        title += monthNames[lastDay.getMonth()] + " ";
    }
    title += lastDay.getDate();
    
    d3.select("#weeklyTitle")
        .text(title);
    
    //set x and y scales
    x.domain(d3.extent(currWeek, function(d) { return d.date; }));
    y.domain([0, d3.max(currWeek, function(d) { return d.bpm; })]);
    
    svg.append("g")
    .attr("class", "x axis")
    .call(xAxis)
    
    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("BPM");
    
    weeklyData[_weekIndex].forEach(function(day) {
        svg.append("path")
        .datum(day)
        .attr("class", "line")
        .attr("d", line)
    })
    
    var dataCirclesGroup = svg.append('svg:g');
    var circles = dataCirclesGroup.selectAll(".data-point")
    .data(currWeek);
    
    circles
    .enter()
    .append("svg:circle")
    .attr("class", "data-point")
    .attr("r", 4)
    .attr("cx", function(d) { return x(d.date); })
    .attr("cy", function(d) { return y(d.bpm); })
    
    
    $('svg circle').tipsy({
        gravity: 'e',
        html: true,
        fade: true,              
        title: function() {
            var d = this.__data__;
            
            var title = "Breath Rate: " + d.bpm + " bpm";
            if (d.location != "") {
                title += "<br /> Location: " + d.location;
            }
            if (d.notes != "") {
                title += "<br /> Notes: " + d.notes;
            }
            if (d.calendar_event != "") {
                title += "<br /> Calendar Event: " + d.calendar_event;
            }
            if (d.mood != "") {
                title += "<br /> Mood: " + d.mood;
            }
            if (d.company != "alone") {
                title += "<br /> With: " + d.company;
            }
            if (d.photo != "") {
                title += "<br /> <img src="+d.photo+" />";
            }
            return title ;
        }
    });
});