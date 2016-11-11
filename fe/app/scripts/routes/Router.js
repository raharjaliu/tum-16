/*global define*/

define([
  'jquery',
  'backbone',
  'views/MainView'
], function ($, Backbone, MainView) {
  'use strict';

  var RouterRouter = Backbone.Router.extend({
    routes: {
      "*actions" : "defaultRoute"
    },

    defaultRoute : function(path) {
      console.log("default path");
      
      this.currentView = new MainView ({el : '.container'});
      this.currentView.render();
    }

  });

  return RouterRouter;
});
