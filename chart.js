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

//Y axis: Time
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
    
    //set y scales 
    y.domain(d3.extent(dailyData[0], function(d) { return d.date; }));
    
    //variables for formatting
    var yOffset = 10;
    var barHeight = 10;
    var yAxisOffset = 28;
       
    //append one day's data to graph
    svg.selectAll(".bar")
        .data(dailyData[0])
      .enter().append("rect")
        .attr("transform", "translate(0, "+yOffset+")")
        .attr("class", "bar")
        .attr("x", x(-xDomain/2.0))
        .attr("width", x(0))
        .attr("y", function(d) { return y(d.date); })
        .attr("height", barHeight)
        .attr("style", function(d) {
            var color = getBPMColor(d.bpm);
            return "fill:rgb("+color.r+","+color.g+","+color.b+")";
        });
       
    svg.append("g")
        .attr("class", "graphHeader")
    .append("text")
        .text(dailyData[0][0].date.toDateString());
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .attr("transform", "translate("+((width/2) - yAxisOffset)+", "+yOffset+")");
    
    //tool tips
    var dataCirclesGroup = svg.append('svg:g');
    var circles = dataCirclesGroup.selectAll(".data-point")
       .data(dailyData[0]);
       
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
