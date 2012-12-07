var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 480 - margin.left - margin.right,
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

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("sampleData.csv", function(data, error) {
    //Split each day into its own bucket
    var dailyData = [[]];
    var numDays = 0;
    var currDay = parseDate(data[0].date).getDate();
    data.forEach(function(d) { 
        d.date = parseDate(d.date);
        d.bpm = +d.bpm;
        if (currDay != d.date.getDate()) {
            numDays++;
            dailyData[numDays] = [];
            currDay = d.date.getDate();
        }
        dailyData[numDays].push(d);
    });
    
    //set x and y scales
    x.domain(d3.extent(dailyData[0], function(d) { return d.date; }));
    y.domain([0, d3.max(dailyData[0], function(d) { return d.bpm; })]);
  
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .text(dailyData[0][0].date);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("BPM");
       
    svg.append("path")
       .datum(dailyData[0])
       .attr("class", "line")
       .attr("d", line)
       
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
