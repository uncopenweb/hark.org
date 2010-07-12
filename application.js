/**
 * Main controller for the HTS site.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.Main');
dojo.require('dojo.parser');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.data.ItemFileReadStore');
dojo.require('org.hark.SearchView');
dojo.require('org.hark.ThumbnailView');

dojo.declare('org.hark.Main', null, {
    constructor: function() {
    }
});

dojo.ready(function() {
    var app = new org.hark.Main();        
});