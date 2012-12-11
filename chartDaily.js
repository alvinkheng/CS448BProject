$(window).bind('orientationchange', orientationHandler);

var margin = {top: 20, right: 10, bottom: 20, left: 60},
    width = 320 - margin.left - margin.right,
    height = 960 - margin.top - margin.bottom;

var X_DOMAIN = 5;
var LOW_BPM = 5;
var HIGH_BPM = 18;
var _orientation = "portrait";
var _moodRadii = [4, 8, 16, 32];

function portraitMode() {  
}

function landscapeMode() {
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
    var normalizedBPM = Math.max(0, Math.min((bpm-5)/(HIGH_BPM-LOW_BPM), 1));
    var color = {};
    color.r = Math.round(normalizedBPM * 255);
    color.g = Math.round((1-normalizedBPM) * 255);
    color.b = Math.round(normalizedBPM * 255);
    return color;
}

d3.csv("Office Worker.csv", function(data, error) {
    //get day from url
    var currDayNumber = (window.location.search != "") ? window.location.search.substring(5) : 4;
    
    //Parse out current day's data
    var currDayData = [];
    data.forEach(function(d) {
        //format date
        d.date = parseDate(d.date);
        //represent bpm as int
        d.bpm = +d.bpm;
        if (d.date.getDate() == currDayNumber) {
            currDayData.push(d);
        }
    });
    
    //Set date as title
    d3.select("#dailyTitle")
        .text(currDayData[0].date.toDateString());
    
    //set y scales 
    y.domain(d3.extent(currDayData, function(d) { return d.date; }));
    
    //variables for formatting
    var barHeight = 10;
    var xOrigin = x(-X_DOMAIN/3.0); //x(0) is center of graph area
    var barWidth = x(-X_DOMAIN/3.0);
       
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
    
    //contextual data
    var contextGroup = svg.append('svg:g');
    
    var dataWithEvents = [];
    var eventLengths = {};
    var dataWithMoods = [];
    var dataWithPhotos = [];
   
   var currEvent = '';
    var eventStartTime;
    currDayData.forEach(function(d) {
        if (d.calendar_event != "") {
                        if (currEvent == '') {
                            dataWithEvents.push(d);
                            currEvent = d.calendar_event;
                            eventStartTime = d.date;
                        } else if (currEvent != d.calendar_event) {
                            eventLengths[currEvent] = y(d.date) - y(eventStartTime);
                            if (d.calendar_event != '') {
                                dataWithEvents.push(d);
                                currEvent = d.calendar_event;
                                eventStartTime = d.date;
                            } else {
                                currEvent == '';
                            }
                        }
        }
        if (d.mood != "") {
            dataWithMoods.push(d);
        }
        if (d.photo != "") {
            dataWithPhotos.push(d);
        }
    });
       eventLengths[currEvent] = y(currDayData[currDayData.length-1].date) - y(eventStartTime);
       
    //Create boxes for every entry that has a calendar event or note
    var eventBox = contextGroup.selectAll(".eventBox")
       .data(dataWithEvents);
       
    //Boxes
    eventBox.enter()
       .append("svg:rect")
       .attr("class", "eventBox")
       .attr("width", x(X_DOMAIN)/3)
       .attr("height", function(d) {return eventLengths[d.calendar_event];})
       .attr("x", x(-X_DOMAIN))
       .attr("y", function(d) { return y(d.date)})
       
    //Text inside boxes
    eventBox.enter()
       .append("text")
       .attr("class", "eventBoxText")
       .attr("width", x(X_DOMAIN)/3)
       .attr("height", 50)
       .attr("x", x(-X_DOMAIN) + 10)
       .attr("y", function(d) { return y(d.date) + 6})
       .text(function(d) { return (d.calendar_event != "") ? d.calendar_event : d.notes;});
            
    //Create mood circles
    var moodCircles = contextGroup.selectAll(".moodLine")
        .data(dataWithMoods);
             
    moodCircles.enter()
       .append("svg:line")
       .attr("class", "moodLine")
       .attr("x1", x(X_DOMAIN/3))
       .attr("x2", x(X_DOMAIN/3)+30)
       .attr("y1", function(d) { return y(d.date)})
       .attr("y2", function(d) { return y(d.date)});
       
    moodCircles.enter()
       .append("svg:circle")
        .attr("class", "moodCircle")
        .attr("fill", function(d) {return d.mood.substring(0,7);})
        .attr("r", function(d){return _moodRadii[d.mood.substring(8)]})
        .attr("cx", x(X_DOMAIN/3)+30)
        .attr("cy", function(d) { return y(d.date)})
                   
    //create photo circles
    var photoCircles = contextGroup.selectAll(".photoCircle")
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
       .attr("x1", x(X_DOMAIN/3))
       .attr("x2", x(X_DOMAIN/3)+30)
       .attr("y1", function(d) { return y(d.date)})
       .attr("y2", function(d) { return y(d.date)});

    photoCircles.enter()
       .append("svg:circle")
       .attr("class", "photoCircle")
       .attr("r", 32)
       .attr("cx", x(X_DOMAIN/3)+62)
       .attr("cy", function(d) { return y(d.date)})
       .attr("fill", function(d) {return "url(#photo)";});
});
