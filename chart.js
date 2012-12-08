var margin = {top: 20, right: 10, bottom: 20, left: 10},
    width = 320 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

var xDomain = 5;

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var parseDate = d3.time.format("%Y-%m-%d %I:%M:%S %p").parse;

var x = d3.scale.linear()
    .domain([-xDomain, xDomain])
    .range([0, width])
    .nice();

var y = d3.time.scale()
    .range([0, height]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right");

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Normalizes the bpm then uses that value to interpolate between green and purple
var lowBPM = 0;
var highBPM = 20;
function getBPMColor(bpm) {
    var normalizedBPM = Math.max(0, Math.min(bpm/(highBPM-lowBPM), 1));
    var color = {};
    color.r = Math.round(normalizedBPM * 255);
    color.g = Math.round((1-normalizedBPM) * 255);
    color.b = Math.round(normalizedBPM * 255);
    return color;
}

d3.csv("sampleData.csv", function(data, error) {
    //Split each day into its own bucket
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
    
    var currDayData = dailyData[0];
    
    //Set date as title
    d3.select("#graphHeader")
        .text(currDayData[0].date.toDateString());
    
    //set y scales 
    y.domain(d3.extent(currDayData, function(d) { return d.date; }));
    
    //variables for formatting
    var barHeight = 10;
    var yAxisOffset = 28;
    var xOrigin = x(-xDomain/4.0);
    var barWidth = x(-xDomain/2.0);
       
    //append one day's data to graph
    svg.selectAll(".bar")
        .data(currDayData)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", xOrigin)
        .attr("width", barWidth)
        .attr("y", function(d) { return y(d.date); })
        .attr("height", barHeight)
        .attr("style", function(d) {
            var color = getBPMColor(d.bpm);
            return "fill:rgb("+color.r+","+color.g+","+color.b+")";
        });
    
    //Draw y axis time labels
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .attr("transform", "translate("+((width/2) - yAxisOffset)+")");
    
    //tool tips
    var dataCirclesGroup = svg.append('svg:g');
    var circles = dataCirclesGroup.selectAll(".data-point")
       .data(currDayData);
       
    circles.enter()
       .append("svg:circle")
       .attr("class", "data-point")
       .attr("r", function(d) { return (d.calendar_event != "" || d.notes != "") ? 8 : 0; })
       .attr("cx", function(d) { if (d.calendar_event != "" || d.notes != "") return x(-xDomain/4); })
       .attr("cy", function(d) { if (d.calendar_event != "" || d.notes != "") return y(d.date); })
       
       
       $('svg circle').tipsy({
                             gravity: 'e',
                             html: true,
                             fade: true,              
                             title: function() {
                                 var d = this.__data__;
                                 
                                 var title = d.bpm + " bpm";
                                 if (d.location != "") {
                                    title += "<br /> @ " + d.location;
                                 }
                                 if (d.notes != "") {
                                     title += "<br /> Notes: " + d.notes;
                                 }
                                 if (d.calendar_event != "") {
                                     title += "<br /> Calendar: " + d.calendar_event;
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
