var isRendered = false;
var cy;
var jsonObj;
var vertices = 0;
var shiftHeld = false;
Session.set("selectedId", null);
Session.setDefault("graphConcise", null);
Session.setDefault("graphJson", null);
Template.canvas.rendered = function() {
  $('#cy').cytoscape({
    style: cytoscape.stylesheet()
      .selector('node')
        .css({
          'background-color': '#B3767E',
          'width': 'mapData(baz, 0, 10, 10, 40)',
          'height': 'mapData(baz, 0, 10, 10, 40)',
          'content': 'data(id)'
        })
      .selector('edge')
        .css({
          'line-color': '#F2B1BA',
          'target-arrow-color': '#F2B1BA',
          'width': 2,
          'opacity': 0.8
        })
      .selector(':selected')
        .css({
          'background-color': 'black',
          'line-color': 'black',
          'target-arrow-color': 'black',
          'source-arrow-color': 'black',
          'opacity': 1
        })
      .selector('.faded')
        .css({
          'opacity': 0.25,
          'text-opacity': 0
        }),
    
    minZoom: 1e-1,
    maxZoom: 1e1,
    layout: {
      name: 'circle',
      padding: 10
    },
    
    ready: function(){
      // ready 1
    }
  });
  cy = $('#cy').cytoscape('get'); 

  cy.on('tap', function(event){
    // cyTarget holds a reference to the originator
    // of the event (core or element)
    var evtTarget = event.cyTarget;

    if( evtTarget !== cy ){

      if (Session.get("selectedId") !== null) {
        //there is already a vertex/edge selected.
        //check if it is a node and selected
        var oldObj = cy.getElementById(Session.get("selectedId"));
        if (oldObj.isNode() && oldObj.selected() && shiftHeld) {
          //check if the newly selected is a node
          if (evtTarget.isNode()) {
            cy.add({edges: [{data: { id: Session.get("selectedId")+"_"+evtTarget.id(), 
                                     source: Session.get("selectedId"), 
                                     target: evtTarget.id() }}]});
            saveGraph();
          }
        }
      }
      Session.set("selectedId", evtTarget.id());
    }
  });
  $(window).on('keydown', function(e){
    if (e.which === 8) {
      //backspace key
      if (!Session.get("enableBackspace")) {
        e.preventDefault();
      }
      
      deleteSelected();
    } else if(e.which === 16) {
      //shift key
      shiftHeld = true;
    }
  });
  $(window).on('keyup', function(e){
    if (e.which === 16) {
      //shift key let go!
      shiftHeld = false;
    }
  });
  isRendered = true;
  draw();
};

Tracker.autorun(function () {
  Session.get("activeGraph");
  if(isRendered) {
    draw();
    saveGraph();
  }
});

draw = function() {
  var activeGraphId = Session.get("activeGraph");
  if (activeGraphId !== "" && activeGraphId !== null && activeGraphId !== undefined) {
    var activeGraph = graphs.findOne({_id: activeGraphId});
    if (activeGraph !== "" && activeGraph !== null && activeGraph !== undefined) {
      //draw the graph
      cy.load();
      jsonObj = {nodes: [], edges: []};
      vertices = 0;
      for(var x = 0; x < activeGraph.graph.length; x++) {
        jsonObj.nodes.push({data: {id: x.toString()}});
        vertices++;
      }

      for(var y = 0; y < activeGraph.graph.length; y++) {
        for(x = 0; x < activeGraph.graph.length - y; x++) {
          if (activeGraph.graph[y][x] === 1) {
            jsonObj.edges.push({data: {id: (y).toString()+"_"+(x+y).toString(), source: (y).toString(), target: (x+y).toString()}});
          }
        }
      }
      cy.add(jsonObj);
    }
  }
};


Template.canvas.helpers({
  selected: function() {
    if (Session.get("selectedId") !== null && Session.get("selectedId") !== undefined) {
      return "active";
    } else return "";
  },
  graphName: function() {
    var activeGraph = graphs.findOne({_id: Session.get("activeGraph")});
    if (activeGraph !== null && activeGraph !== undefined) {
      return activeGraph.name;
    }
    return "";
  },
  conciseArray: function() {
    var arr = Session.get("graphConcise");
    if (arr !== null && arr !== undefined) {
      var stringOutput = "";
      for(var y = 0; y < arr.length; y++) {
        for(var x = 0; x < y; x++) {
          stringOutput += "  ";
        }
        for(x = 0; x < arr.length - y; x++) {
          stringOutput += arr[y][x].toString();
          if(x<arr.length - y -1) {
            stringOutput += " ";
          }
        }
        stringOutput+= "\n";
      }
      return stringOutput;
    }
    return "Error (conciseArray)";
  },
  standardArray: function() {
    var arr = Session.get("graphConcise");
    if (arr !== null && arr !== undefined) {
      var stringOutput = "";
      for(var y = 0; y < arr.length; y++) {
        for(var x = 0; x < y; x++) {
          //x becomes the y value
          stringOutput += arr[x][y-x].toString();
          stringOutput += " ";
        }
        for(x = 0; x < arr.length - y; x++) {
          stringOutput += arr[y][x].toString();
          if(x<arr.length - y -1) {
            stringOutput += " ";
          }
        }
        stringOutput+= "\n";
      }
      return stringOutput;
    }
    return "Error (standardArray)";
  },
  graphJson: function() {
    return JSON.stringify(Session.get("graphJson"), null, 4);
  }
});
Template.canvas.events({
  'click .add-vertex': function() {
    vertices++;
    cy.add({
      group: "nodes",
      data: { id: vertices.toString()},
      position: { x: 40*vertices, y: 40*vertices }
    });
    saveGraph();
  },
  'click .delete-selected': function() {
    deleteSelected();
  },
  'click .export': function() {
    $('#exportModal').modal('show');
  },
  'click .save': function() {
    saveGraph();
  }
});

saveGraph = function() {
  var edges = cy.json().elements.edges;
  var verticies = cy.json().elements.nodes;
  var verticiesIds = [];
  var graphArr = [];

  //edges/vertices may not be defined. 
  //Length must always be defined (0 if no edges/vertices).
  var edgesLength;
  var verticesLength;
  if(edges === undefined || edges === null) {
    edgesLength = 0;
  } else {
    edgesLength = edges.length;
  }
  if(verticies === undefined || verticies === null) {
    verticiesLength = 0;
  } else {
    verticiesLength = verticies.length;
  }

  //create a 2D triangle array of 0s
  for(var y = 0; y < verticiesLength; y++) {
    tempArr = [];
    for(x = 0; x < verticiesLength - y; x++) {
      tempArr.push(0);
    }
    graphArr.push(tempArr);
  }

  //create an array of the IDs of the verticies.
  for(var i = 0; i < verticiesLength; i++) {
    verticiesIds.push(verticies[i].data.id);
  }
  //iterate through each edge, and fill in the graphArr
  for(i = 0; i < edgesLength; i++) {
    // var source = parseInt(edges[i].data.source);
    // var target = parseInt(edges[i].data.target);
    var source = verticiesIds.indexOf(edges[i].data.source);    
    var target = verticiesIds.indexOf(edges[i].data.target);

    if(target < source) {
      var temp = source;
      source = target;
      target = temp;
    }  
    //target >= source so that it is always in the right hand side of the table.
    if(source < verticies.length && target < verticiesLength && target >= source) {
      //move target (x) back across to the left.
      target = target - source;
      graphArr[source][target]++;
    } 
  }
  console.log("setting graph arr: ", graphArr);
  Session.set("graphConcise", graphArr);
  Session.set("graphJson", cy.json().elements);
  // var activeGraph = graphs.findOne({_id: Session.get("activeGraph")});
  graphs.update(Session.get("activeGraph"), {$set: {graph: graphArr}});
};

deleteSelected = function() {
  if (Session.get("selectedId") !== null && Session.get("selectedId") !== undefined) {
    cy.remove(cy.getElementById(Session.get("selectedId")));
    Session.set("selectedId", null);
    saveGraph();
  }
};


