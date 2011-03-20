/**
 * Game catalog controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require('dojo.hash');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.i18n');
dojo.require('org.hark.pages.common');
dojo.require('org.hark.widgets.SiteTabs');
dojo.require('org.hark.widgets.SiteActions');
dojo.require('org.hark.widgets.GameSearch');
dojo.require('org.hark.widgets.GameListModel');
dojo.require('org.hark.widgets.GameListView');
dojo.require('org.hark.widgets.GameListKeys');
dojo.require('org.hark.widgets.GameListAudio');
dojo.require('org.hark.widgets.GameFrame');

dojo.ready(function() {
    // make sure this browser is viable
    uow.ui.checkBrowser();
    
    // original title
    var originalTitle = document.title;
    // do our own label interpolation for the page
    var labels = org.hark.localizePage('games');
    // publish the db and help localization to use
    var locale = org.hark.publishLang('home');
    // selected game
    var selectedUrl = '';
    
    // listen for hash changes
    dojo.subscribe('/dojo/hashchange', function(h) {
        var url = decodeURIComponent(h);

        if(url === selectedUrl) {
            // avoid publishing the same selection twice
            return;
        }

        if(!h) {
            dojo.publish('/org/hark/ctrl/unselect-game', [null]);
        } else {
            // @todo: lookup game details and publish game selection
            dojo.publish('/org/hark/ctrl/select-game', [null, {url : url}]);
        }
    });
    // listen for game selects and unselects
    dojo.subscribe('/org/hark/ctrl/select-game', function(ctrl, item) {
        // store selected url
        selectedUrl = item.url;
        // mark body with playing style
        dojo.addClass(dojo.body(), 'playing');
        // @todo: need full item for this
        //var title = item.label[locale] || item.label['en-us'];
        //document.title = title;
        dojo.hash(encodeURIComponent(item.url));
    });
    dojo.subscribe('/org/hark/ctrl/unselect-game', function(ctrl, item) {
        dojo.removeClass(dojo.body(), 'playing');
        document.title = originalTitle;
        selectedUrl = '';
        if(ctrl) {
            // adjust hash if another controller, not the hash listener in this
            // controller, unselected the game
            dojo.hash('');
        }
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

    // honor initial hash
    var h = dojo.hash();
    if(h) {
        // @todo: fetch selected game details
        var url = decodeURIComponent(h);
        dojo.publish('/org/hark/ctrl/select-game', [null, {url : url}]);
    }
});