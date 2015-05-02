Router.configure({
  layoutTemplate: 'home',
  notFoundTemplate: 'notfound'
});
//Removed:
//loadingTemplate: 'loading',
//Because it causes the the loading template to appear for millisecond when switching subscriptions.
Router.onBeforeAction('loading');

Router.map(function () {
  this.route('graphs', {
    path: '/',
    template: 'graphs',
    waitOn: function() {
      return Meteor.subscribe("graphs");
    }
  });
});
