var margin = {top: 20, right: 20, bottom: 20, left: 30},
width = 320 - margin.left - margin.right,
height = 372 - margin.top - margin.bottom;

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var parseDate = d3.time.format("%m-%d-%Y %H:%M:%S").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .tickFormat(d3.time.format("%H"))
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.bpm); });

var svg = d3.select("#chartInstant").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var LOW_BPM = 5;
var HIGH_BPM = 18;

//Normalizes the bpm then uses that value to interpolate between green and purple
function getBPMColor(bpm) {
    var normalizedBPM = Math.max(0, Math.min((bpm-5)/(HIGH_BPM-LOW_BPM), 1));
    var color = {};
    color.r = Math.round(normalizedBPM * 255);
    color.g = Math.round((1-normalizedBPM) * 255);
    color.b = Math.round(normalizedBPM * 255);
    return color;
}

d3.csv("Office Worker.csv", function(data, error) { 
    var dailyData = [[]];
    var numDays = 0;
    var currDay = parseDate(data[0].date).getDate();
    data.forEach(function(d) { 
        //format date
        d.date = parseDate(d.date);
        //represent bpm as int
        d.bpm = +d.bpm;
        if (currDay != d.date.getDate()) {
            numDays++;
            dailyData[numDays] = [];
            currDay = d.date.getDate();
        }
        dailyData[numDays].push(d);
    });
    
    
    //Set date as title
    var now = new Date();
    var hours = now.getHours();
    var ampm = (hours>=12) ? ampm = "PM" : "AM";
    if (hours > 12) {
        hours -= 12;
    }
    d3.select("#instantTitle")
        .text("TODAY::" + hours + ":" + now.getMinutes() + " " + ampm);
    
    //set x and y scales
    
    var today = dailyData[dailyData.length-1];
    
    x.domain(d3.extent(today, function(d) { return d.date; }));
    y.domain([0, d3.max(dailyData[0], function(d) { return d.bpm; })]);
    
    svg.append("g")
    .attr("class", "x axis instant")
    .call(xAxis)
    .attr("transform", "translate(0," + height + ")")
    
    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("text-anchor", "end")
    .text("Breath Rate");
    
    today.length = today.length/2 + 5;
    
    svg.append("path")
        .datum(today)
        .attr("class", "line")
        .attr("d", line)
    
    var now = [];
    now.push(today[today.length-1]);
    
    var dataCirclesGroup = svg.append('svg:g');
    var circles = dataCirclesGroup.selectAll(".data-point")
    .data(now);
    
    circles
    .enter()
    .append("svg:circle")
    .attr("class", "data-point")
    .attr("r", 16)
    .attr("cx", function(d) { return x(d.date); })
    .attr("cy", function(d) { return y(d.bpm); })
    .attr("style", function(d) {
        var color = getBPMColor(d.bpm);
        return "fill:rgb("+color.r+","+color.g+","+color.b+")";
    });
    
    circles
    .enter()
    .append("svg:text")
    .attr("x", function(d) { return x(d.date)-6; })
    .attr("y", function(d) { return y(d.bpm)+4; })
    .attr("style", "fill:white")
    .text(function(d){return Math.round(d.bpm)});
});