/**
 * Game details view widget.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.DetailsView');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'DetailsView');

dojo.declare('org.hark.DetailsView', [dijit._Widget, dijit._Templated], {
    // game data
    game : null,
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark', 'templates/DetailsView.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark','DetailsView');
    },

    postCreate: function() {
    },
    
    resize: function() {
        var box = dojo.contentBox(this.domNode);
        this.containerNode.resize(box);
    },
    
    startup: function() {
        this.containerNode.startup();
    },

    uninitialize: function() {

    }
});