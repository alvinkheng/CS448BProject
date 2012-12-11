var margin = {top: 30, right: 20, bottom: 20, left: 60},
    width = 640 - margin.left - margin.right,
    height = 372 - margin.top - margin.bottom;

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var parseDate = d3.time.format("%Y-%m-%d %I:%M:%S %p").parse;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.time.scale()
    .range([0, height]);

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.days)
    .orient("top");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

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
    var weeklyData = [];
    var dailyData = [[]];
    var currDay = parseDate(data[data.length-1].date).toDateString();
    var numDays = 0;
    //Parse data to be separated by weeks and days
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
    var oneWeekAgo = new Date(lastDay.getTime() - 1000 * 60 * 60 * 24 * 6);
    var title = monthNames[oneWeekAgo.getMonth()] + " " + oneWeekAgo.getDate() + " - ";
    if (lastDay.getMonth() != oneWeekAgo.getMonth()) {
        title += monthNames[lastDay.getMonth()] + " ";
    }
    title += lastDay.getDate();
    d3.select("#weeklyTitle")
        .text(title);
    
    //set x and y scales
    var xDomain = [];
    xDomain.push(new Date(currWeek[0].date.toDateString()));
    var lastDay = new Date(currWeek[currWeek.length-1].date.toDateString());
    lastDay = new Date(lastDay.getTime() + 23 * 60 * 60 * 1000);
    xDomain.push(lastDay);
    x.domain(xDomain);
    y.domain(d3.extent(weeklyData[_weekIndex][0], function(d) { 
        var newDate = new Date();
        newDate.setHours(d.date.getHours());
        newDate.setMinutes(d.date.getMinutes());
        return newDate; }));
    
    //draw x axis
    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
    
    //draw y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    
    //variables for formatting
    var barHeight = 10;
    var barWidth = width/weeklyData[_weekIndex].length - 10;
    
    //append each day's data to graph
    weeklyData[_weekIndex].forEach(function(day) {
        svg.selectAll(".bars")
            .data(day)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(new Date(d.date.toDateString())); })
            .attr("width", barWidth)
            .attr("y", function(d) { 
                var newDate = new Date();
                newDate.setHours(d.date.getHours());
                newDate.setMinutes(d.date.getMinutes());
                return y(newDate); })
            .attr("height", barHeight)
            .attr("style", function(d) {
                var color = getBPMColor(d.bpm);
                return "fill:rgb("+color.r+","+color.g+","+color.b+")";
            })
            .on("click", function(d) { 
                window.location.replace('dailyView.html?day='+d.date.getDate());
            });
    });
    
});