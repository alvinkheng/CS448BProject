var margin = {top: 20, right: 20, bottom: 20, left: 30},
width = 640 - margin.left - margin.right,
height = 372 - margin.top - margin.bottom;

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var parseDate = d3.time.format("%Y-%m-%d %I:%M:%S %p").parse;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var _currFilter = (window.location.search != "") ? window.location.search.substring(8) : "location";

var svg = d3.select("#chartAggregate").append("svg")
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

var _titles = {location: 'where do you find calm...', people: 'who makes you calm...', period: 'when are you calm...', calendar_event: 'what makes you calm...'};


d3.csv("Office Worker.csv", function(data, error) { 
       var filterData = {}, numFilters = {}, filters = [];
       
       data.forEach(function(d) { 
                    //format date
                    d.date = parseDate(d.date);
                    //represent bpm as int
                    d.bpm = +d.bpm;
                    if (d[_currFilter] != '' && !filterData[d[_currFilter]]) {
                        filterData[d[_currFilter]] = 0;
                        numFilters[d[_currFilter]] = 0;
                        filters.push(d[_currFilter]);
                    }
                    filterData[d[_currFilter]] += d.bpm;
                    numFilters[d[_currFilter]]++;
                    });
       
       filters.forEach(function(d) {
                       filterData[d] /= numFilters[d];
                       });

       
       //Set date as title
       var lastDay = data[data.length-1].date; //latest day
       var oneWeekAgo = new Date(lastDay.getTime() - 1000 * 60 * 60 * 24 * 7);
       var title = monthNames[oneWeekAgo.getMonth()] + " " + oneWeekAgo.getDate() + " - ";
       if (lastDay.getMonth() != oneWeekAgo.getMonth()) {
        title += monthNames[lastDay.getMonth()] + " ";
       }
       title += lastDay.getDate();
       d3.select("#aggregateTitle")
       .text(_titles[_currFilter]);
       
       //set x and y scales
       x.domain(filters);
       y.domain([0, d3.max(data, function(d) { return d.bpm; })]);
       
       svg.append("g")
           .attr("class", "x axis agg")
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
           .text("Average Breath Rate");
       
       var barWidth = width/filters.length - 5;
       
       svg.selectAll(".bar")
           .data(filters)
           .enter().append("rect")
           .attr("class", "bar")
           .attr("style", function(d) {
                 var color = getBPMColor(filterData[d]);
                 return "fill:rgb("+color.r+","+color.g+","+color.b+")";
                 })
           .attr("x", function(d) { return x(d); })
           .attr("width", barWidth)
           .attr("y", function(d) { return y(filterData[d]); })
           .attr("height", function(d) { return height - y(filterData[d]); });
       
}); 