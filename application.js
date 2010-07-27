/**
 * Main controller for the HTS site.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.Main');
dojo.require('dojo.hash');
dojo.require('dojo.parser');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('dijit.MenuBar');
dojo.require('dijit.Dialog');
dojo.require('dojox.data.AndOrReadStore');
dojo.require('org.hark.LoginButton');
dojo.require('org.hark.SearchView');
dojo.require('org.hark.ThumbnailView');
dojo.require('org.hark.DetailsView');

// root path for all urls
var ROOT_PATH = '../';

dojo.declare('org.hark.Main', null, {
    constructor: function() {
        // current details view
        this._details = null;
        // connect token for fade in
        this._dlgFadeTok = null;
        
        // show the footer once loaded
        dojo.style(dojo.byId('footer'), 'visibility', '');
        // list for hash
        dojo.subscribe('/dojo/hashchange', this, '_onHashChange');
        var hash = dojo.hash();
        if(hash) {
            this._onHashChange(hash);
        }
        // reset hash to blank after dialog close
        var dlg = dijit.byId('dialog');
        dojo.connect(dlg, 'hide', dojo.hitch(dojo, 'hash', ''));
    },
    
    _onHashChange: function(value) {
        if(!value) { return; }
        if(this._details) {
            this._details.destroyRecursive();
            dojo.disconnect(this._dlgFadeTok);
        }
        // get game data
        appsModel.fetchItemByIdentity({
            identity: value,
            onItem: this._onItem,
            onError: this._onError,
            scope: this
        });
    },
    
    _onItem: function(item) {
        // get item fields
        // @todo: cycle screenshots
        var game = {
            label : appsModel.getValue(item, 'label'),
            description : appsModel.getValue(item, 'description'),
            path: ROOT_PATH + appsModel.getValue(item, 'path'),
            tags : appsModel.getValue(item, 'tags'),
            screenshot : ROOT_PATH + appsModel.getValue(item, 'media').screenshots[0],
        };
        this._details = new org.hark.DetailsView({game : game});
        var dlg = dijit.byId('dialog');
        dlg.attr('title', game.label);
        dlg.attr('content', this._details);
        dlg.show();
        // force a resize after fade in
        // @todo: store to disconnect to avoid memory waste
        this._dlgFadeTok = dojo.connect(dlg._fadeIn, 'onEnd', this._details, 
            'resize');
    },
    
    _onError: function(err) { 
        console.error(err);
    }
});

dojo.ready(function() {
    var app = new org.hark.Main();        
});