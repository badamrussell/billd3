(function(){
  var voteData = {};
  var bill,keywords, intervalSetup, stateInterval;
  var voters = [];
  var height = 560;
  var width = 700;
  var yeaColor = "#777";
  var nayColor = "#ccc";
  var elseColor = "#aaa";
  var activeState = "";
  var currentCircle = 0;
  var currentState = 0;
  var currentVote;

  var $keywordArea = $(".keywords");
  var $billArea = $(".bill-info");
  var $voteArea = $(".vote-info");
  // var $indiVote = $voteArea.find("article").clone();
  // $voteArea.empty();

  var stateData;
  
  var offValue = 10;
  var mainPositions = { "YR": {x: 20, y: 70, xoffset: offValue, yoffset: offValue, count: 0},
                        "YI": {x: 10, y: height/2, xoffset: offValue, yoffset: 0, count: 0},
                        "YD": {x: 20, y: height-50, xoffset: offValue, yoffset: -offValue, count: 0},
                        "NR": {x: width-20, y: 70, xoffset: -offValue, yoffset: offValue, count: 0}, 
                        "NI": {x: width-10, y: height/2, xoffset: -offValue, yoffset: 0, count: 0}, 
                        "ND": {x: width-20, y: height-50, xoffset: -offValue, yoffset: -offValue, count: 0},
                        "E": {x: width/2, y: height, xoffset: 0, yoffset: 0, count: 0},
                        "YS": {x: 20, y: height/2, xoffset: 0, yoffset: 0, count: 0},
                        "ES": {x: width/2, y: height/2, xoffset: 0, yoffset: 0, count: 0},
                        "NS": {x: (width - 20), y: height/2, xoffset: 0, yoffset: 0, count: 0}
                      }

  var nodes = [];

  var svgContainer = d3.select("#vote-area")
                    .append("svg")

                    .attr("width", width)
                    .attr("height", height);

  var yeaArea = svgContainer.append("rect")
                            .attr("x", 0)
                            .attr("y", 50)
                            .attr("width", width/2)
                            .attr("height", height-100)
                            .attr("fill", yeaColor);
  var nayArea = svgContainer.append("rect")
                            .attr("x", width/2)
                            .attr("y", 50)
                            .attr("width", width/2)
                            .attr("height", height-100)
                            .attr("fill", nayColor);
  var elseArea = svgContainer.append("rect")
                            .attr("x", width/2 - 80)
                            .attr("y", height - 130)
                            .attr("width", 160)
                            .attr("height", 80)
                            .attr("fill", elseColor);
  var nayText = svgContainer.selectAll("text")
                            .data([ {value:"YEA", "x": (width/2) - 102, "y": 50, "fill": yeaColor, "disableFill": "#fff"},
                                    {value:"NAY", "x": width/2 - 2, "y": 50, "fill": nayColor, "disableFill": "#fff"},
                                    {value:"NONE", "x": width/2 - 72, "y": height-14, "fill": elseColor, "disableFill": elseColor}])
                            .enter()
                            .append("text")
                            .text( function(d) { return d.value; })
                            .attr("x", function(d) { return d.x; })
                            .attr("y", function(d) { return d.y; })
                            .attr("font-size", "50px")
                            .attr("font-weight", "bold")
                            .attr("font-family", "sans-serif")
                            .attr("fill", function(d) { return d.fill; });

  var svgState;

  d3.json("states.json", function(d3data){
    stateData = d3data.stateInfo;

    svgState = svgContainer.selectAll("path")
                            .data(stateData)
                            .enter()
                            .append("path")
                            .attr("fill", elseColor)
                            .attr('d', function(d) { return d.path; })
                            // .attr("stroke", "#eee")
                            .attr("transform","translate(160,160)scale(.4,.4)");
  });

   

  var stateText = svgContainer.append("text")
                              .text("")
                              .attr("x", width/2)
                              .attr("y", 100)
                              .attr("font-size", "30px")
                              .attr("font-weight", "bold")
                              .attr("font-family", "sans-serif")
                              .attr("align", "center")
                              .attr("fill", "#fff");

  var force = d3.layout.force()
                .alpha(0.8)
                .gravity(0.03)
                .charge(-16)
                .nodes(nodes)
                .size([width, height]);


  

  var colorIt = function(c) {

    if (c == "R"){
      return "red";
    } else if(c == "D") {
      return "#3366FF";
    } else {
      return "green";
    }
  }

  var getRadius = function(age) {
    return 0.2 * (age-15);
  }

  var sendInLegislators = function() {
    // console.log([voters[currentCircle]]);
    svgContainer.append("circle")
      .data([voters[currentCircle]])
      .attr("cx", width/2)
      .attr("cy", height/2 )
      .attr("r", function(d) { return getRadius(d.age); })
      .style("fill", function(d) { return colorIt(d.party); });
    
    nodes.push(voters[currentCircle])
    currentCircle += 1;

    if (currentCircle == voters.length) {
      clearInterval(intervalSetup);
      stateInterval = window.setInterval( changeState, 1500);
    }

    force.start();
  };

  var changeState = function() {
    activeState = stateData[currentState].abb;
    // stateText.text(stateData[currentState].name);
    currentState = (currentState+1) == stateData.length ? 0 : currentState + 1;

    svgContainer.selectAll("path")
                .attr("fill", function(d) {
                  var sVote = currentVote.states[d.abb];
                  if (d.abb == activeState) {
                    return "#ffd700";
                  } else if (sVote > 0) {
                    return yeaColor;
                  } else if (sVote < 0) {
                    return nayColor;
                  } else {
                    return elseColor;
                  }
                });

    force.start();
  };


  force.on("tick", function(e){
    var k = force.alpha() * 0.05;
    for (i in mainPositions) {
      mainPositions[i].count = 0;
    }

    nodes.forEach(function(node) {
      var center = {}
      var xOffset = 0;

      if (node.state == activeState) {
        if (node.value == "Yea") {
          center = mainPositions["YS"];
        } else if (node.value == "Nay") {
          center = mainPositions["NS"];
        } else {
          center = mainPositions["ES"];
        }
      } else if (currentVote.voters[node.voter_id] == undefined) {
        center = {"x": width/2, "y": -50 };

      } else {
        center = mainPositions[currentVote.voters[node.voter_id]];

        // if (center.count > 5) {
        //   center.count = 0;
        // } else {
        //   center.count += 1;
        // }
        

        // xOffset = center.count * 10;
      }
      node.x += (center.x - node.x + center.xoffset + xOffset) * k;
      node.y += (center.y - node.y + center.yoffset) * k;

      // if (node.x < 0) { node.x += 2;
      // } else if (node.x > (width)) { node.x -= 2;
      // }
      // if (node.y < 0) {node.y += 2;
      // } else if (node.y > (height)) { node.y -= 2;
      // }
      
    });

    svgContainer.selectAll("circle")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
                
  });

  
  var updateYeaNayText = function() {
    if (currentVote.votes.result.indexOf("Reject") == -1) {
      nayText.attr("fill", function(d) {
        if (d.value == "YEA") {
          return yeaColor;
        } else {
          return d.disableFill
        }
      });
    } else {
      nayText.attr("fill", function(d) {
        if (d.value == "NAY") {
          return nayColor;
        } else {
          return d.disableFill
        }
      });
    }
  };

  var update_page = function(skipSend){
    clearInterval(intervalSetup);
    clearInterval(stateInterval);
    force.stop();
    // $keywordArea.append("<p>" + keywords.join() + "</p>");
    $billArea.append("<h1>" + bill.official_title + "</h1>");

    // $voteArea.empty();
    $voteArea.append("<h2>Votes for " + bill.bill_id + "</h2>")
    for (var i=0; i < voteData.length; i++) {
      var v = voteData[i].votes;
      // $newIndiVote = $indiVote.clone();
      // $newIndiVote.
      // $voteArea.append('<article class="vote"><a href="#"><h3>' + v.question + '</h3></a><ul><li>' + v.chamber + '</li><li>' + v.required + '</li><li>' + v.result + '</li></ul></article>');
      $voteArea.append('<a href="#" data-id=' + i + '><h3><span>' + v.chamber + '</span> : ' + v.vote_type + '</h3></a>');
      // $voteArea.append($newIndiVote);
    }

    intervalSetup = window.setInterval( sendInLegislators, 50);
    
    updateYeaNayText();
  }

  var request_bill = function(){
    Congress.getVote("s1926-113", function(data){
      console.log("VOTE",data)
      voteData = data;
      currentVote = data[0];
      bill = data.bill;
      voters = data.voters;
      keywords = bill.keywords;

      update_page()
    });
    // Congress.getAll(function(congress_data){
    //   data = congress_data;
    //   bill = data.bills[0];
    //   keywords = bill.keywords;

    //   update_page()
    // });
  }

  $("#btn-find").on("click", function(event){
    event.preventDefault();
    var $textInput = $("#find-text");
    var text = $textInput.attr("value");
    console.log("click find");
    request_bill(text)
  });

  $("#btn-next").on("click", function(event){
    event.preventDefault();
    console.log("click find");
  });

  $voteArea.on("click","a", function(event){
    event.preventDefault();
    var $target = $(event.currentTarget);
    currentVote = voteData[$target.data("id")];
    updateYeaNayText();
  });

  // request_bill();
})()



