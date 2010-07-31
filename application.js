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
        
        // get the games database
        var dbDef = uow.getDatabase({
            database : 'harkhome', 
            collection : 'games', 
            mode : 'r'}
        );
        dbDef.addCallback(dojo.hitch(this, '_onDatabaseReady'));
        
        // @todo: show a spinner while loading to avoid funky layout
    },
    
    _onDatabaseReady: function(database) {
        // get database reference
        this._db = database;
        // announce db availability
        dojo.publish('/model', [this._db]);

        // @todo: hide the loading spinner

        // show the footer once loaded
        dojo.style(dojo.byId('footer'), 'visibility', '');
        // listen for hash changes
        dojo.subscribe('/dojo/hashchange', this, '_onHashChange');
        var hash = dojo.hash();
        if(hash) {
            // handle initial hash
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
        this._db.fetch({
            query: {hash : value},
            onItem: this._onItem,
            onError: this._onError,
            scope: this
        });
    },
    
    _onItem: function(item) {
        // get item fields
        // @todo: cycle screenshots
        var game = {
            label : this._db.getValue(item, 'label'),
            description : this._db.getValue(item, 'description'),
            path: ROOT_PATH + this._db.getValue(item, 'path'),
            tags : this._db.getValue(item, 'tags'),
            screenshot : ROOT_PATH + this._db.getValue(item, 'media').screenshots[0],
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