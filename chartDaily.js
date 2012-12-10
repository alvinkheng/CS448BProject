$(window).bind('orientationchange', orientationHandler);

var margin = {top: 20, right: 10, bottom: 20, left: 60},
    width = 320 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

var X_DOMAIN = 5;
var LOW_BPM = 0;
var HIGH_BPM = 20;
var _orientation = "portrait";
var _data;
var _dailyData;
var _currDay;

function setCurrDay(day) {
    _currDay = day;
}

function portraitMode() {  
    var currDayData = _dailyData[0];
    
    d3.select("#graphHeader")
        .text(currDayData[0].date.toDateString());
    
    y.domain(d3.extent(currDayData, function(d) { return d.date; }));
    
    //Transition x-axis
    svg.select("g.y.axis")
        .transition()
        .duration(2500)
        .call(yAxis);
}

function landscapeMode() {
    d3.select("#graphHeader")
        .text("Weekly View");
    
//    d3.select("#chart")
//        .attr("display", "none");
//    
//    d3.select("chartWeekly")
//        .attr("display", "block");
    
    
    y.domain(d3.extent(_data, function(d) { return d.date; }));
    //Transition x-axis
    svg.select("g.y.axis")
        .transition()
        .duration(2500)
        .call(yAxis);
}

function orientationHandler() {
    if($(window).width() < $(window).height()) {
        _orientation = "portrait";
        portraitMode();
    } else if($(window).width() > $(window).height()) {
        _orientation = "landscape";
        landscapeMode();
    }
}

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var parseDate = d3.time.format("%Y-%m-%d %I:%M:%S %p").parse;

var x = d3.scale.linear()
    .domain([-X_DOMAIN, X_DOMAIN])
    .range([0, width])
    .nice();

var y = d3.time.scale()
    .range([0, height]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#chartDaily").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Normalizes the bpm then uses that value to interpolate between green and purple
function getBPMColor(bpm) {
    var normalizedBPM = Math.max(0, Math.min(bpm/(HIGH_BPM-LOW_BPM), 1));
    var color = {};
    color.r = Math.round(normalizedBPM * 255);
    color.g = Math.round((1-normalizedBPM) * 255);
    color.b = Math.round(normalizedBPM * 255);
    return color;
}

d3.csv("sampleData.csv", function(data, error) {
    _data = data;
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
    
    _dailyData = dailyData;
    var currDayData = dailyData[0];
    
    //Set date as title
    d3.select("#dailyTitle")
        .text(currDayData[0].date.toDateString());
    
    //set y scales 
    y.domain(d3.extent(currDayData, function(d) { return d.date; }));
    
    //variables for formatting
    var barHeight = 10;
    var yAxisOffset = 28;
    var xOrigin = x(-X_DOMAIN/4.0);
    var barWidth = x(-X_DOMAIN/2.0);
       
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
       
    
    //tool tips
    var dataCirclesGroup = svg.append('svg:g');
    
    var dataWithEvents = [];
    var dataWithMoods = [];
    var dataWithPhotos = [];
   
    currDayData.forEach(function(d) {
                        if (d.calendar_event != "" || d.notes != "") {
                            dataWithEvents.push(d);
                        }
                        if (d.mood != "") {
                            dataWithMoods.push(d);
                        }
                        if (d.photo != "") {
                            dataWithPhotos.push(d);
                        }
                        });
       
    var eventBox = dataCirclesGroup.selectAll(".eventBox")
       .data(dataWithEvents);
       
    eventBox.enter()
       .append("svg:rect")
       .attr("class", "eventBox")
       .attr("width", width/3)
       .attr("height", 50)
       .attr("x", x(-X_DOMAIN) + 5)
       .attr("y", function(d) { return y(d.date)})
       
    eventBox.enter()
       .append("text")
       .attr("class", "eventBoxText")
       .attr("width", width/3)
       .attr("height", 50)
       .attr("x", x(-X_DOMAIN) + 10)
       .attr("y", function(d) { return y(d.date) + 12})
       .text(function(d) { return (d.calendar_event != "") ? d.calendar_event : d.notes;});
             
    var moodCircles = dataCirclesGroup.selectAll(".moodLine")
        .data(dataWithMoods);
             
    moodCircles.enter()
       .append("svg:line")
       .attr("class", "moodLine")
       .attr("x1", x(X_DOMAIN/4))
       .attr("x2", x(X_DOMAIN/4)+30)
       .attr("y1", function(d) { return y(d.date)})
       .attr("y2", function(d) { return y(d.date)});
       
    moodCircles.enter()
       .append("svg:circle")
        .attr("class", "moodCircle")
        .attr("fill", function(d) {return d.mood;})
        .attr("r", 8)
        .attr("cx", x(X_DOMAIN/4)+38)
        .attr("cy", function(d) { return y(d.date)})
                   
          
    var photoCircles = dataCirclesGroup.selectAll(".photoCircle")
       .data(dataWithPhotos);
       
    photoCircles.enter()
        .append("pattern")
        .attr("id", "photo")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("height", "32")
        .attr("width", "32")
        .append("image")
        .attr("xlink:href", function(d){return d.photo;})
        .attr("width", "32")
        .attr("height", "32");
    
    photoCircles.enter()
       .append("svg:line")
       .attr("class", "moodLine")
       .attr("x1", x(X_DOMAIN/4))
       .attr("x2", x(X_DOMAIN/4)+30)
       .attr("y1", function(d) { return y(d.date)})
       .attr("y2", function(d) { return y(d.date)});

    photoCircles.enter()
       .append("svg:circle")
       .attr("class", "photoCircle")
       .attr("r", 16)
       .attr("cx", x(X_DOMAIN/4)+46)
       .attr("cy", function(d) { return y(d.date)})
       .attr("fill", function(d) {return "url(#photo)";});
});
