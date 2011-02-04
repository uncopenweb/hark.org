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
dojo.require('org.hark.widgets.GameSearch');
dojo.require('org.hark.widgets.GameListModel');
dojo.require('org.hark.widgets.GameListView');
dojo.require('org.hark.widgets.GameListKeys');

// root path for all urls
var ROOT_PATH = '../';
// known supported translations
var LANGS = [];

org.hark.urlToSlug = function(url) {
    return url.replace(/\//g, '|').replace(/#/g, '.');
};

org.hark.slugToUrl = function(slug) {
    return slug.replace(/\./g, '#').replace(/\|/g, '/');
}

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
    

    function _onDatabaseReady(db) {
        // announce db availability
        dojo.publish('/org/hark/db/'+db.collection, [db]);
    }
    
    function _onDatabaseFailed(err) {
        // bad, show error and give up
        // @todo
    }

    // get the games, tags collections
    var args = {database : 'harkhome', mode : 'r', collection : 'games'};
    uow.getDatabase(args).then(_onDatabaseReady, _onDatabaseFailed);
    args.collection = 'tags';
    uow.getDatabase(args).then(_onDatabaseReady, _onDatabaseFailed);    
});

// dojo.require('uow.ui.LoginButton');
// dojo.require('uow.ui.BusyOverlay');
// dojo.require('org.hark.DetailsView');
// dojo.require('org.hark.GameFrame');
// dojo.requireLocalization('org.hark', 'application');
// 

// 

// dojo.declare('org.hark.Details', null, {
//     constructor: function(args) {
//         // localized labels
//         this._labels = args.labels;
//         // details dialog widget
//         this._details = null;
//         // database instance
//         this._db = null;
//         // listen for new models
//         dojo.subscribe('/org/hark/model', this, 'setModel');
//         // listen for more info requests
//         dojo.subscribe('/org/hark/info', this, '_onShowDetails');
//     },
//     
//     setModel: function(db) {
//         this._db = db;
//     },
//         
//     _onShowDetails: function(url) {
//         if(!url) { return; }
//         if(this._details) {
//             this._details.destroyRecursive();
//         }
// 
//         // show the dialog immediately with a busy placeholder
//         var dlg = dijit.byId('dialog');
//         dlg.attr('title', this._labels.loading_label);
//         dlg.attr('content', '<div class="harkDetailsView"></div>');
//         dlg.show();
//         
//         // show busy until done
//         this._busy = uow.ui.BusyOverlay.show({
//             busyNode: dlg.containerNode.firstChild,
//             parentNode: dlg.containerNode,
//             takeFocus: false
//         });
// 
//         // get game data
//         this._db.fetch({
//             query: {url : url},
//             onItem: this._onItem,
//             onError: this._onError,
//             scope: this
//         });
//     },
//     
//     _onItem: function(item) {
//         // get item fields
//         // @todo: cycle screenshots
//         var url = this._db.getValue(item, 'url');
//         var label = this._db.getValue(item, 'label');
//         label = label[dojo.locale] || label['en-us'];
//         var description = this._db.getValue(item, 'description');
//         description = description[dojo.locale] || description['en-us'];
//         var tags = this._db.getValue(item, 'tags');
//         tags = tags[dojo.locale] || tags['en-us'];
//         
//         var game = {
//             label : label,
//             description : description,
//             slug: org.hark.urlToSlug(url),
//             tags : tags,
//             screenshot : ROOT_PATH + this._db.getValue(item, 'media').screenshots[0],
//         };
//         // show game details
//         this._details = new org.hark.DetailsView({game : game});
//         var dlg = dijit.byId('dialog');
//         dlg.attr('title', game.label);
//         dlg.attr('content', this._details);
//         // hide busy overlay
//         uow.ui.BusyOverlay.hide(this._busy);
//     },
//     
//     _onError: function(err) { 
//         console.error(err);
//     }    
// });
// 
// dojo.declare('org.hark.Main', null, {
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