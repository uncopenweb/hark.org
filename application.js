/**
 * Main controller for the HTS site.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.Main');
dojo.require('dojo.parser');
dojo.require('dijit.form.Button');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');

dojo.declare('org.hark.Main', null, {
    constructor: function() {
    }
});

dojo.ready(function() {
    var app = new org.hark.Main();        
});