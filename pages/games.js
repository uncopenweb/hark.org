/**
 * Game catalog controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require('dojo.hash');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.i18n');
dojo.require('org.hark.widgets.SiteTabs');
dojo.require('org.hark.widgets.SiteActions');
dojo.require('org.hark.widgets.GameSearch');
dojo.require('org.hark.widgets.GameListModel');
dojo.require('org.hark.widgets.GameListView');
dojo.require('org.hark.widgets.GameListKeys');
dojo.require('org.hark.widgets.GameListAudio');
dojo.require('org.hark.widgets.GameFrame');

// root path for all urls
var ROOT_PATH = '../';
// known supported translations
var LANGS = [];

org.hark.urlToSlug = function(url) {
    return url.replace(/\//g, '|').replace(/#/g, '.');
};

org.hark.slugToUrl = function(slug) {
    return slug.replace(/\./g, '#').replace(/\|/g, '/');
};

org.hark.connectKeys = function() {
    // start listening for global keys
    dojo.body().focus();
    try {
        uow.ui.connectKeys();
    } catch(e) { }
};

org.hark.disconnectKeys = function() {
    // disable global key catch
    try {
        uow.ui.disconnectKeys();
    } catch(e) {
        return;
    }
};


dojo.ready(function() {
    // make sure this browser is viable
    uow.ui.checkBrowser();
    
    var labels;
    try {
        labels = dojo.i18n.getLocalization('org.hark.pages', 'games');
    } catch(e) { }
    if(labels) {
        dojo.query('[data-label]').forEach(function(node) {
            var name = node.getAttribute('data-label');
            var text = labels[name];
            if(text) {
                node.innerHTML = labels[name];
            }
        });
    }
    
    // determine language to use
    var lang = 'en-us'
    if(dojo.indexOf(dojo.locale, LANGS) != -1) {
        // use translation
        lang = dojo.locale;
    }
    dojo.publish('/org/hark/lang', [lang]);
    
    // listen for game selects and unselects
    dojo.subscribe('/org/hark/ctrl/select-game', function() {
        dojo.addClass(dojo.body(), 'playing');
    });
    dojo.subscribe('/org/hark/ctrl/unselect-game', function() {
        dojo.removeClass(dojo.body(), 'playing');
    });

    // get the games, tags collections
    var _onDatabaseReady = function(db) {
        // announce db availability
        dojo.publish('/org/hark/db/'+db.collection, [db]);
    };
    
    var _onDatabaseFailed = function(err) {
        // bad, show error and give up
        // @todo
    };
    var args = {database : 'harkhome', mode : 'r', collection : 'games'};
    uow.getDatabase(args).then(_onDatabaseReady, _onDatabaseFailed);
    args.collection = 'tags';
    uow.getDatabase(args).then(_onDatabaseReady, _onDatabaseFailed);    
    
    // trigger login method
    dijit.byId('site_actions').triggerLogin();
});

//     constructor: function(args) {
//         // localized labels
//         this._labels = args.labels;
//         // busy dialog overlay
//         this._busy = null;
//         // connect token for fade in
//         this._dlgFadeTok = null;
//         
//         // show localized labels
//         dojo.query('[data-label]').forEach(function(node) {
//             var name = node.getAttribute('data-label');
//             node.innerHTML = this._labels[name];
//         }, this);
//         
//         // listen for auth changes
//         dojo.subscribe('/uow/auth', this, '_onInitDatabase');
//         // start with empty hash to avoid double trigger
//         var hash = dojo.hash();
//         if(!hash) {
//             dojo.hash('#');
//         }
//         // listen for hash changes
//         dojo.subscribe('/dojo/hashchange', this, '_onHashChange');
//         // trigger first login
//         dijit.byId('login').triggerLogin();
//         // handle initial hash
//         this._onHashChange(hash);
//     },
//     
//     _onInitDatabase: function() {
//         this._db = null;
// 
//         // get the games database for the user locale
//         var args = {
//             database : 'harkhome', 
//             collection : 'games', 
//             mode : 'r'
//         };
//         uow.getDatabase(args).then(
//             dojo.hitch(this, '_onDatabaseReady'),
//             dojo.hitch(this, '_onDatabaseFailed')
//         );
//     },
//     
//     _onDatabaseReady: function(database) {
//         // get database reference
//         this._db = database;
//         // announce db availability
//         dojo.publish('/org/hark/model', [this._db]);
//     },
//     
//     _onDatabaseFailed: function(err) {
//         // @todo
//     },
//     
//     _onHashChange: function(slug) {
//         var display = (slug) ? 'none' : '';        
//         // show/hide main layout and footer
//         var layout = dojo.byId('layout');
//         var footer = dojo.byId('footer');
//         dojo.style(layout, 'display', display);
//         dojo.style(footer, 'display', display);
//         // clean up any visible details dialog
//         var dlg = dijit.byId('dialog');
//         dlg.hide();
//         // start/stop game
//         var url = (slug) ? (ROOT_PATH + org.hark.slugToUrl(slug)) : '';
//         var game = dijit.byId('game');
//         console.log('url:', url);
//         game.attr('url', url);
//     }
// });
// 