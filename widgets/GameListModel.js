/**
 * Game list model.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameListModel');
dojo.require('dijit._Widget')

dojo.declare('org.hark.widgets.GameListModel', [dijit._Widget], {
    // results per page fetch
    perPage : 10,
    postMixInProperties: function() {
        // number of results fetched
        this.fetched = 0;
        // total results available 
        this.available = 0;
        // current database
        this._db = null;
        // current query for results
        this._query = '';
        // locale for queries
        this._locale = '';
    },

    postCreate: function(args) {
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/org/hark/search', this, 'newSearch');
        dojo.subscribe('/org/hark/db/games', this, '_onGamesDb');
    },
    
    newSearch: function(text) {
        this._reset();
        this._query = text;
        if(this._db) {
            this._search();
            return true;
        }
        return false;
    },
    
    fetchMore: function() {
        if(this.fetched >= this.available) {
            return false;
        }
        this._page += 1;
        this._search();
        return true;
    },
    
    _onGamesDb: function(db) {
        this._reset();
        this._db = db;
        this._search();
    },
    
    _reset: function() {
        // reset the count
        this.fetched = 0;
        this.available = 0;
        // reset current page
        this._page = 0;
        dojo.publish('/org/hark/games/reset', [this]);
    },
    
    _search: function() {
        dojo.publish('/org/hark/games/fetch', [this, this._page, this._query]);
        // build the query
        var ors = dojo.map(['label', 'description', 'tags'], function(item) {
            var obj = {};
            var name = item+'.'+this._locale;
            var value = '*'+this._query+'*';
            obj[name] = value;
            return obj;
        }, this);
        var query = {$or : ors};
        var req = this._db.fetch({
            query: query,
            onBegin: this._onBegin,
            onItem: this._onItem,
            onComplete: this._onComplete,
            onError: this._onError,
            start: this._page * this.perPage,
            count: this.perPage,
            sort : [{
                attribute : 'label.'+this._locale,
                descending : false
            }],
            scope: this
        });
    },
    
    _onBegin: function(size, request) {
        // keep track of total results
        this.available = size;
        dojo.publish('/org/hark/games/begin', [this, this._db, this.available]);
    },
    
    _onItem: function(item) {
        if(item) {
            dojo.publish('/org/hark/games/item', [this, this._db, item]);
        }
        this.fetched += 1;
    },
    
    _onComplete: function() {
        dojo.publish('/org/hark/games/done', [this, this._db, this.fetched]);
    },
    
    _onError: function(err) {
        dojo.publish('/org/hark/games/error', [this, this._db, err]);
    }
});