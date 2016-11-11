/*global define*/

define([
  'jquery',
  'underscore',
  'backbone',
  'templates'
], function ($, _, Backbone, JST) {
  'use strict';

  var MainViewView = Backbone.View.extend({
    template: JST['app/scripts/templates/MainView.ejs'],

    tagName: 'div',

    id: '',

    className: '',

    events: {},

    initialize: function () {

    },

    render: function () {
      this.$el.html(this.template({}));
    }
  });

  return MainViewView;
});
