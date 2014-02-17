var jsonCircles = [
  {
   "x_axis": 30,
   "y_axis": 30,
   "radius": 20,
   "color" : "green"
  }, {
   "x_axis": 70,
   "y_axis": 70,
   "radius": 20,
   "color" : "purple"
  }, {
   "x_axis": 110,
   "y_axis": 100,
   "radius": 20,
   "color" : "red"
}];

var lineData = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
                 { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
                 { "x": 80,  "y": 5},  { "x": 100, "y": 60}];

var lineFunction = d3.svg.line()
                    .x(function(d){ return d.x })
                    .y(function(d){ return d.y })
                    .interpolate("linear");

// var lineGraph = svgContainer.append("path")
//                             .attr("d", lineFunction(lineData))
//                             .attr("stroke", "blue")
//                             .attr("stroke-width", 2)
//                             .attr("fill", "none");


var jsonRectangles = [
  { "x_axis": 10, "y_axis": 10, "height": 20, "width":20, "color" : "green" },
  { "x_axis": 160, "y_axis": 40, "height": 20, "width":20, "color" : "purple" },
  { "x_axis": 70, "y_axis": 70, "height": 20, "width":20, "color" : "red" }
];

var svgContainer = d3.select("body").append("svg")
                    .attr("width", 200)
                    .attr("height", 100)
                    .style("border", "1px solid black");




var rectangles = svgContainer.selectAll("rect")
                            .data(jsonRectangles)
                            .enter()
                            .append("rect");

var rectangleAttributes = rectangles
                          .attr("x", function(d) { return d.x_axis; })
                          .attr("y", function(d) { return d.y_axis; })
                          .attr("height", function(d) { return d.height; })
                          .attr("width", function(d) { return d.width; })
                          .style("fill", function(d) { return d.color; });


// var circles = svgContainer.selectAll("circle")
//   .data(jsonCircles)
//   .enter()
//   .append("circle");

// var circleAttributes = circles
//   .attr("cx", function(d) { return d.x_axis; })
//   .attr("cy", function(d) { return d.y_axis; })
//   .attr("r", function(d) { return d.radius; })
//   .style("fill", function(d) { return d.color; });

