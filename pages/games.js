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
dojo.require('org.hark.widgets.PreferencesAudio');
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
    
    // do our own label interpolation for the page
    var labels = org.hark.localizePage('games');

    // publish the db and help localization to use
    org.hark.publishLang('home');
    
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