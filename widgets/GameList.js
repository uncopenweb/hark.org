/**
 * Game search results.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameList');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'GameList');

dojo.declare('org.hark.widgets.GameList', [dijit._Widget, dijit._Templated], {
    // results per page fetch
    perPage : 10,
    // result row template
    resultTemplate : dojo.cache('org.hark.widgets.templates', 'GameListItem.html'),
    // widget template
    templateString : dojo.cache('org.hark.widgets.templates', 'GameList.html'),
    postMixInProperties: function() {
        this._labels = dojo.i18n.getLocalization('org.hark.widgets','GameList');
        this._labels.more_results_label = dojo.replace(
            this._labels.more_results_label, [this.perPage]);
        // current results on page
        this._shownCount = 0;
        // current database
        this._db = null;
        // current query for results
        this._query = '';
        // busy dialog
        this._busy = null;
    },
    
    postCreate: function(args) {
        // controller published events
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/org/hark/search', this, 'onSearch');
        dojo.subscribe('/org/hark/db/games', this, 'onModel');
    },
    
    onSearch: function(text) {
        this._reset();
        this._query = text;
        if(this._db) {
            this._search();
        }
    },
    
    onModel: function(db) {
        this._reset();
        this._db = db;
        this._search();
    },
    
    _showStatus: function(state) {
        // hide all status
        dojo.query('div', this._statusNode).style({display : 'none'});
        // show status for state
        dojo.query('div.'+state, this._statusNode).style({display : ''});
    },
    
    _reset: function() {
        // clear the existing rows
        dojo.empty(this._resultsNode);
        // reset the count
        this._shownCount = 0;        
        // reset current page
        this._page = 0;
    },
    
    _search: function() {
        this._showStatus('loading');
        // build the query
        var ors = dojo.map(['label', 'description', 'tags'], function(item) {
            var obj = {};
            var name = item+'.'+dojo.locale;
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
                attribute : 'label.'+dojo.locale,
                descending : false
            }],
            scope: this
        });
    },
    
    _onBegin: function(size, request) {
        console.log(size);
        // keep track of total results
        this._totalAvailable = size;
    },
    
    _onItem: function(item) {
        if(item) {
            var tmpl = this.resultTemplate;
            var url = this._db.getValue(item, 'url');
            var label = this._db.getValue(item, 'label');
            label = label[dojo.locale] || label['en-us'];
            var desc = this._db.getValue(item, 'description');
            desc = desc[dojo.locale] || desc['en-us'];
            var tags = this._db.getValue(item, 'tags');
            tags = tags[dojo.locale] || tags['en-us'];
            var html = dojo.replace(tmpl, {
                _labels : this._labels,
                game_href :  '#' + org.hark.urlToSlug(url),
                game_label : label,
                game_description : desc,
                game_tags : tags,
                icon_src : ROOT_PATH + this._db.getValue(item, 'media').icon,
                icon_alt : label
            });
            dojo.create('div', {
                innerHTML : html,
                className : 'harkGameListItem'
            }, this._resultsNode);
        }
        this._shownCount += 1;
    },
    
    _onComplete: function() {
        if(this._totalAvailable === 0) {
            this._showStatus('none');
        } else if(this._shownCount < this._totalAvailable) {
            this._showStatus('more');
        } else {
            this._showStatus('done');
        }
    },
    
    _onError: function(err) {
        console.error('error', err);
    },
    
    _onClickNext: function(event) {
        this._page += 1;
        this._search();
        dojo.stopEvent(event);
    }
});