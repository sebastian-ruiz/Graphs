graphs = new Meteor.Collection("graphs");

Meteor.publish('graphs', function() {
  return graphs.find();
});
