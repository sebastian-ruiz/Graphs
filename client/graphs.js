graphs     = new Meteor.Collection("graphs");

Template.graphs.rendered = function() {
  //open sidebar
  $("#wrapper").toggleClass("toggled");
  var K33Obj = graphs.findOne({name: "K_[3,3]"});
  if (K33Obj === null || K33Obj === undefined) {
    var K33  = [[0,0,0,1,1,1],
                  [0,0,1,1,1],
                    [0,1,1,1],
                      [0,0,0],
                        [0,0],
                          [0]];
    graphs.insert({name:"K_[3,3]", graph: K33});
  } else {
    Session.set('activeGraph', K33Obj._id);
  }
  var K4bj = graphs.findOne({name: "K_[4]"});
  if (K4bj === null || K4bj === undefined) {
    var K4 = [[0,1,1,1],
                [0,1,1],
                  [0,1],
                    [0]];
    graphs.insert({name:"K_[4]", graph: K4});
  }
  
};

Template.graphs.helpers({

});

Template.graphs.events({
  'click .menu-toggle' : function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  }
});
