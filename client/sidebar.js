Template.sidebar.rendered = function() {
  $('#addNewModal').on('shown.bs.modal', function () {
      $('#graphName').focus();
  });
  $('#addNewModal').on('hidden.bs.modal', function (e) {
    console.log("modal disappeared");
    Session.set("enableBackspace", false);
  });
};

Template.sidebar.helpers({
  graphs: function() {
    return graphs.find();
  },
  verticesEdges: function() {
    var query = graphs.findOne({_id: this._id });
    if(query !== null && query !== undefined) {
      var edges = 0;
      for(var x = 0; x < this.graph.length; x++) {
        for(var y = 0; y < this.graph.length - x; y++) {
          if (this.graph[x][y] === 1) edges++;
        }
      }
      return _.extend({}, this, {vertices: this.graph.length, edges: edges});
    }else {
      return _.extend({}, this);
    }
  },
  isActive: function() {
    if (Session.get("activeGraph") === this._id)
      return "active";
    else
      return "";
  }
});

Template.sidebar.events({
  'click .sidebar-graph': function() {
    if (this._id !== null && this._id !== undefined)
      Session.set("activeGraph", this._id);
  },
  'click .add-new': function() {
    Session.set("enableBackspace", true);
    $('#addNewModal').modal('show');
  },
  'click .create-new': function(err,tmpl) {
    var graphName = tmpl.find('#graphName').value;
    if(graphName !== "" && graphName !== null && graphName !== undefined) {
      graphs.insert({name: graphName, graph: []});
      $('#addNewModal').modal('hide');
      
    }
  },
  'click .import': function() {
    $('#importModal').modal('show');
  }
});

