/**
 * Game play controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.i18n');
dojo.require('org.hark.pages.common');
dojo.require('org.hark.widgets.GameFrame');

dojo.ready(function() {
    // make sure this browser is viable
    uow.ui.checkBrowser();
    
    // do our own label interpolation for the page
    var labels = org.hark.localizePage('games');
    // publish the db and help localization to use
    var locale = org.hark.publishLang('home');
    var args = dojo.queryToObject(window.location.search.substr(1));
    // game id
    var id = args.g;
    
    var goToCatalog = function() {
        // go back to game catalog with ?g=id
        var segs = window.location.pathname.split('/');
        segs[segs.length-1] = 'games.html';
        window.location.pathname = segs.join('/');
    };
    
    // listen for game selects and unselects
    dojo.subscribe('/org/hark/ctrl/leave-page', goToCatalog);

    var _onDatabaseReady = function(db) {
        // find the item based on its id
        db.fetchOne({query : {_id : id}}).then(function(item) {
            // publish the item for the game frame
            dojo.publish('/org/hark/ctrl/select-game', [null, item]);
        }, goToCatalog);
    };
    
    var _onDatabaseFailed = function(err) {
        // bad, show error and give up
        // @todo
    };
    var args = {database : 'harkhome', mode : 'r', collection : 'games'};
    uow.getDatabase(args).then(_onDatabaseReady, _onDatabaseFailed);
    
    // trigger login method
    dijit.byId('site_actions').triggerLogin();
});