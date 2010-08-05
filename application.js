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
dojo.require('org.hark.BusyOverlay');
dojo.require('org.hark.LoginButton');
dojo.require('org.hark.SearchView');
dojo.require('org.hark.ThumbnailView');
dojo.require('org.hark.DetailsView');
dojo.require('org.hark.GameFrame');

// root path for all urls
var ROOT_PATH = '..';

dojo.declare('org.hark.Main', null, {
    constructor: function() {
        // busy dialog overlay
        this._busy = null;
        // current details view
        this._details = null;
        // connect token for fade in
        this._dlgFadeTok = null;
        
        // listen for more info requests
        dojo.subscribe('/info', this, '_onShowDetails');
        
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
    },
    
    _onHashChange: function(hash) {
        var display = (hash) ? 'none' : '';
        // show/hide main layout and footer
        dojo.style(dojo.byId('layout'), 'display', display);
        dojo.style(dojo.byId('footer'), 'display', display);
        // start/stop game
        var frame = dijit.byId('frame');
        frame.attr('url', hash);
    },
    
    _onShowDetails: function(url) {
        if(!url) { return; }
        if(this._details) {
            this._details.destroyRecursive();
        }

        // show the dialog immediately with a busy placeholder
        var dlg = dijit.byId('dialog');
        // @todo: translate
        dlg.attr('title', 'Loading');
        dlg.attr('content', '<div class="harkDetailsView"></div>');
        dlg.show();
        
        // show busy until done
        this._busy = org.hark.BusyOverlay.show({
            busyNode: dlg.containerNode.firstChild,
            parentNode: dlg.containerNode,
            takeFocus: false
        });

        // get game data
        this._db.fetch({
            query: {url : url},
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
        // show game details
        this._details = new org.hark.DetailsView({game : game});
        var dlg = dijit.byId('dialog');
        dlg.attr('title', game.label);
        dlg.attr('content', this._details);
        // hide busy overlay
        org.hark.BusyOverlay.hide(this._busy);
    },
    
    _onError: function(err) { 
        console.error(err);
    }
});

dojo.ready(function() {
    var app = new org.hark.Main();        
});