/**
 * Game catalog controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.i18n');
dojo.require('org.hark.pages.common');
dojo.require('org.hark.widgets.GameSearch');
dojo.require('org.hark.widgets.GameListModel');
dojo.require('org.hark.widgets.GameListView');
dojo.require('org.hark.widgets.GameListKeys');
dojo.require('org.hark.widgets.GameListAudio');

dojo.ready(function() {
    // do common setup
    org.hark.init('games');
    
    // go to the home page
    var goHome = function() {
        // go back to home page
        var segs = window.location.pathname.split('/');
        segs[segs.length-1] = 'index.html';
        window.location.pathname = segs.join('/');
    };
    
    // listen for game selects and unselects
    dojo.subscribe('/org/hark/ctrl/select-game', function(ctrl, item) {
        // store selected url
        var id = encodeURIComponent(item._id);
        // go to play.html?g=gameId
        window.location = 'play.html?g='+id;
    });    
    // listen for game selects and unselects
    dojo.subscribe('/org/hark/ctrl/leave-page', goHome);

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
});