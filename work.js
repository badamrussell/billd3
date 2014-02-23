(function(){
  var voteData = {};
  var bill,keywords, intervalSetup, stateInterval;
  var voters = [];
  var height = 560;
  var width = 700;
  var yeaColor = "#777";
  var nayColor = "#ccc";
  var elseColor = "#aaa";
  var currentCircle = 0;
  var currentState = -1;
  var currentVoteIndex = 0;
  var currentVote;

  var $keywordArea = $(".keywords");
  var $billTitle = $(".bill-title");
  var $voteArea = $(".vote-info");
  var $actionText = $(".find-action")
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
                            .data([ {value:"YEA", "size": "50px", "x": (width/2) - 128, "y": 50, "fill": yeaColor, "disableFill": "#fff"},
                                    {value:"NAY", "size": "50px", "x": width/2 + 24, "y": 50, "fill": nayColor, "disableFill": "#fff"},
                                    {value:"NO VOTE", "size": "34px", "x": width/2 - 76, "y": height-26, "fill": elseColor, "disableFill": elseColor}])
                            .enter()
                            .append("text")
                            .text( function(d) { return d.value; })
                            .attr("x", function(d) { return d.x; })
                            .attr("y", function(d) { return d.y; })
                            .attr("font-size", function(d) { return d.size; } )
                            .attr("font-weight", "bold")
                            .attr("font-family", "sans-serif")
                            .attr("fill", function(d) { return d.fill; })
                            .attr("stroke", function(d) { return d.fill })
                            .attr("stroke-width", 0.50);

  var svgOutline = svgContainer.append("g");   
  var svgState = svgContainer.append("g");                      
  var circleGroup = svgContainer.append("g");
  var navigationGroup = svgContainer.append("g");
  var svgTitle = svgContainer.append("g");
  // navigationGroup.attr("transform","translate(100,100)");

  var votingTitle = svgTitle.selectAll("text")
                            .data([1])
                            .enter()
                            .append("text")
                            .attr("x", width/2)
                            .attr("y", 70)
                            .text("hello")
                            .attr("font-size", "16px")
                            .attr("font-weight", "bold")
                            .attr("font-family", "sans-serif")
                            .attr("text-anchor","middle")
                            .attr("fill", "#111");

  var directionArrows = [ {"path": "M40,0L20,0L0,30L20,60L40,60L20,30L40,0z", "x": 5, "y": 270, "step": -1, "active": false, "other": 0 },
                          {"path": "M0,0L20,0L40,30L20,60L0,60L20,30L0,0z", "x": 665, "y": 270, "step": 1, "active": false, "other": 1 }
                        ]
  var updateNavigation = function() {
    if (voteData.length <= 1) {
      directionArrows[0].active = false;
      directionArrows[1].active = false;
    } else if (currentVoteIndex <= 0) {
      directionArrows[0].active = false;
      directionArrows[1].active = true;
    } else if (currentVoteIndex >= voteData.length - 1) {
      directionArrows[0].active = true;
      directionArrows[1].active = false;
    } else {
      directionArrows[0].active = true;
      directionArrows[1].active = true;
    }

    navigationGroup.selectAll("path")
                    .attr("opacity",function(d) { 
                                if (d.active){
                                  return 1;
                                } else {
                                  return 0;
                                }
                              })
  }

  var nextArrow = navigationGroup.selectAll("path")
                              .data(directionArrows)
                              .enter()
                              .append("path")
                              .attr("d", function(d) { return d.path; })
                              // .attr("d", "M0,0L20,0L40,30L20,60L0,60L20,30L0,0z")
                              .attr("fill", "#ddd")
                              .attr("stroke","#333")
                              .attr("opacity", 0)
                              .attr("transform",function(d){ return "translate("+d.x+","+d.y+") scale(.7,.7)"; })
                              .on("click", function(d, i){
                                if (d.active == false) { return false; }
                                currentVoteIndex += d.step;

                                if (currentVoteIndex <= 0) {
                                  currentVoteIndex = 0;
                                  d.active = false;
                                } else if (currentVoteIndex >= (voteData.length - 1)) {
                                  currentVoteIndex = voteData.length - 1;
                                  d.active = false;
                                }
                                changeVote(currentVoteIndex);
                              })
                              .on("mouseover", function(d){
                                if (d.active == false) { return false; }
                                d3.select(this).attr("fill","#ffd700");
                              })
                              .on("mouseleave", function(d){
                                if (d.active == false) { return false; }
                                d3.select(this).attr("fill","#ddd");
                              });

  var building = svgContainer.selectAll("image")
                            .data([1])
                            .enter()
                            .append("svg:image")
                            .attr("x", width/2 - 25)
                            .attr("y", 0)
                            .attr("height", 50)
                            .attr("width", 50)
                            .attr("xlink:href", "images/building.png");
  

 
   
  d3.json("states.json", function(d3data){
    stateData = d3data.stateInfo;

    svgState.selectAll("path")
            .data(stateData)
            .enter()
            .append("path")
            .attr("fill", elseColor)
            .attr('d', function(d) { return d.path; })
            // .attr("stroke", "#eee")
            .attr("transform","translate(20,80)scale(.7,.7)")
            .on("mouseover", function(d, i) {
              currentState = i; 
              // d3.select(this).attr("fill", "#ffd700");
              changeState();
            })
            .on("mouseleave", function(d){
              currentState = -1;
              d3.select(this).attr("fill",getStateColor(d));
            })
            .on("click", function(d, i) {
              currentState = i; 
              changeState();
            });
  });

   d3.xml("usaOutline.svg", function(d3data){
    // console.log(">>>>",d3data);
    // outlinePath = d3data.usaOutline.path;
    pathData = $($(d3data).find("path")).attr("d")
    // console.log(outlinePath)
    svgOutline.append("path")
            .attr('d', pathData)
            .attr("fill", "rgba(0,0,0,0)")
            .attr("stroke", "#555")
            .attr("stroke-width", 2)
            .attr("transform","translate(22,78)scale(.7,.7)");
  });

  var force = d3.layout.force()
                .alpha(0.8)
                .gravity(0.03)
                .charge(-16)
                .nodes(nodes)
                .size([width, height]);


  

  var getRadius = function(age) {
    return 0.2 * (age-15);
  }

  var sendInLegislators = function() {
    // console.log([voters[currentCircle]]);
    circleGroup.append("circle")
      .data([voters[currentCircle]])
      .attr("cx", width/2)
      .attr("cy", height/2 )
      .attr("r", function(d) { return getRadius(d.age); })
      .classed("legislator", true)
      .classed("democrat", function(d) { return d.party == "D"; })
      .classed("republican", function(d) { return d.party == "R"; })
      .classed("independent", function(d) { return d.party == "I"; });

    nodes.push(voters[currentCircle])
    currentCircle += 1;

    if (currentCircle == voters.length) { clearInterval(intervalSetup); }

    force.start();
  };

  var getStateColor = function(d) {
    if (currentVote == undefined) { return elseColor; };

    var sVote = currentVote.states[d.abb];
    var activeState;
    if (currentState >= 0) { activeState = stateData[currentState].abb; }

    if (d.abb == activeState) {
      return "#ffd700";
    } else if (sVote > 0) {
      return yeaColor;
    } else if (sVote < 0) {
      return nayColor;
    } else {
      return elseColor;
    }
  }

  var updateState = function() {
    svgState.selectAll("path").attr("fill", function(d) { return getStateColor(d); });
  }

  var changeState = function() {
    if (currentVote == undefined) { return false; }
    updateState();
    force.start();
  };


  force.on("tick", function(e){
    var k = force.alpha() * 0.05;
    for (i in mainPositions) {
      mainPositions[i].count = 0;
    }

    var activeState;
    if (currentState >= 0) { activeState = stateData[currentState].abb; }

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

  var changeVote = function(vote_id){
    // console.log("CV",currentVote);
    currentVote = voteData[vote_id];
    updateNavigation();

    svgTitle.selectAll("text").text(currentVote.votes.question);
    // votingTitle.selectAll("text").text(currentVote.votes.question);
    // votingTitle
    updateYeaNayText();
    updateState();
    force.start();
  }

  var update_page = function(skipSend){
    clearInterval(intervalSetup);
    clearInterval(stateInterval);
    force.stop();

    $billTitle.text(bill.official_title);


    currentCircle = 0;
    intervalSetup = window.setInterval( sendInLegislators, 20);
    changeVote(0);
    updateYeaNayText();
  }

  var request_bill = function(findText){
    $actionText.text("finding...");

    Congress.getVote(findText, function(data){
      console.log("VOTE",data)

      if (data.bill == undefined) {
        $actionText.text("not found.");
      } else {
        $actionText.text( data.length + " votings found");
        voteData = data;
        currentVote = data[0];
        bill = data.bill;
        voters = data.voters;
        keywords = bill.keywords;

        update_page()
      }
      
    });
  }

  var resetPage = function() {
    $billTitle.empty();
    $voteArea.empty();
    circleGroup.selectAll("circle").remove();

    while(nodes.length > 0) {
      nodes.pop();
    }

    svgState.selectAll("path")
            .attr("fill", elseColor);

    nayText.attr("fill", function(d) { return d.fill; });

    clearInterval(intervalSetup);
    clearInterval(stateInterval);
    force.stop();

  }

  $("#btn-find").on("click", function(event){
    event.preventDefault();
    var $textInput = $("#find-text");
    var text = $textInput.val();
    resetPage();
    request_bill(text)
  });

  // $("#btn-next").on("click", function(event){
  //   event.preventDefault();
  //   console.log("click find");
  // });

  // request_bill("s1926-113");
})()



