/*
 *  PreferencesView.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.PreferencesView');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'PreferencesView');

dojo.declare('org.hark.PreferencesView', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark', 'templates/PreferencesView.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark','PreferencesView');
        
    },

    postCreate: function() {

    },

    startup: function() {

    },

    uninitialize: function() {

    },
    
    _onChange: function(value) {
        console.log(value);
    }
});