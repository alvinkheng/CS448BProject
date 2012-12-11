var margin = {top: 20, right: 20, bottom: 20, left: 30},
width = 320 - margin.left - margin.right,
height = 385 - margin.top - margin.bottom;

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var parseDate = d3.time.format("%Y-%m-%d %I:%M:%S %p").parse;

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

var LOW_BPM = 0;
var HIGH_BPM = 20;

//Normalizes the bpm then uses that value to interpolate between green and purple
function getBPMColor(bpm) {
    var normalizedBPM = Math.max(0, Math.min(bpm/(HIGH_BPM-LOW_BPM), 1));
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
    d3.select("#instantTitle")
        .text("Today");
    
    //set x and y scales
    x.domain(d3.extent(dailyData[0], function(d) { return d.date; }));
    y.domain([0, d3.max(dailyData[0], function(d) { return d.bpm; })]);
    
    svg.append("g")
    .attr("class", "x axis instant")
    .call(xAxis)
    .attr("transform", "translate(0," + height + ")")
    
    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "translate(75)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Breath Rate");
    
    dailyData.forEach(function(day) {
        svg.append("path")
        .datum(day)
        .attr("class", "line")
        .attr("d", line)
    })
    
    var today = [];
    today.push(dailyData[0][dailyData[0].length-1]);
    
    var dataCirclesGroup = svg.append('svg:g');
    var circles = dataCirclesGroup.selectAll(".data-point")
    .data(today);
    
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
    .attr("x", function(d) { return x(d.date)-4; })
    .attr("y", function(d) { return y(d.bpm)+4; })
    .attr("style", "fill:white")
    .text(function(d){return Math.round(d.bpm)});
    
        
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