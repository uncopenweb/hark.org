/**
 * Game search results.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameList');
dojo.require('dijit._Widget');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'GameList');

dojo.declare('org.hark.widgets.GameList', [dijit._Widget], {
    // current page
    page : 0,
    // results per page fetch
    perPage : 10,
    // result row template
    resultTemplate : dojo.cache('org.hark.widgets.templates', 'ResultItem.html'),
    postMixInProperties: function() {
        this._labels = dojo.i18n.getLocalization('org.hark.widgets','GameList');
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
    
    _reset: function() {
        // clear the existing rows
        dojo.empty(this.domNode);
        // reset the count
        this._shownCount = 0;        
        // reset current page
        this.page = 0;
    },
    
    _search: function() {
        // if(!this._busy) {
        //     // show busy until done
        //     var self = this;
        //     uow.ui.showBusy({
        //         busyNode: this.domNode,
        //         parentNode: dojo.body(),
        //         takeFocus: false
        //     }).then(function(busy) {
        //         self._busy = busy;
        //         // @todo: have to check if op already complete
        //     });
        // }

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
            start: this.page * this.perPage,
            // fetch one extra to check if there's a next
            count: this.perPage,
            sort : [{
                attribute : 'label.'+dojo.locale,
                descending : false
            }],
            scope: this
        });
    },
    
    _onBegin: function(size, request) {
        // keep track of total results
        this._totalAvailable = size;
        // if(size) {
        //     // update summary counts
        //     var start = request.start + 1;
        //     var end = Math.min(request.start + request.count, size);
        //     var text = dojo.replace(this._labels.summary_label, 
        //         [start, end, size]);
        // } else {
        //     var text = this._labels.no_results_label;
        // }
        // dojo.query('.summary .position', this.resultsNode).forEach('item.innerHTML = "'+text+'"');
    },
    
    _onItem: function(item) {
        if(item) {
            var tmpl = this.resultTemplate;
            var url = this._db.getValue(item, 'url');
            var label = this._db.getValue(item, 'label');
            label = label[dojo.locale] || label['en-us'];
            var desc = this._db.getValue(item, 'description');
            desc = desc[dojo.locale] || desc['en-us'];
            var html = dojo.replace(tmpl, {
                game_href :  '#' + org.hark.urlToSlug(url),
                game_title : dojo.replace(this._labels.more_info_title, [label]),
                game_label : label,
                game_description : desc,
                icon_src : ROOT_PATH + this._db.getValue(item, 'media').icon,
                icon_alt : label,
                //screenshot_src : ROOT_PATH + this._db.getValue(item, 'media').screenshots[0],
                play_button_label : this._labels.play_button_label,
                play_button_title : dojo.replace(this._labels.play_button_title, [label])
            });
            dojo.create('div', {
                innerHTML : html,
                className : 'harkGameListItem'
            }, this.domNode);
            // var node = this._resultNodes[row * this._cols + col];
            // dojo.addClass(node, 'active');
            // node.innerHTML = html;
            // // listen for play button clicks
            // var button = dojo.query('button', node)[0];
            // dojo.connect(button, 'onclick', function() {
            //     dojo.hash('#' + org.hark.urlToSlug(url));
            // });
            // var mi = [dojo.query('a', node)[0], dojo.query('img', node)[0]];
            // // listen for more info click
            // dojo.forEach(mi, function(item) {
            //     dojo.connect(item, 'onclick', dojo.hitch(this, '_onMoreInfo', url));
            // }, this);
        }
        this._shownCount += 1;
    },
    
    _onComplete: function() {
        // var prev = dojo.query('.navigation-previous > a');
        // var next = dojo.query('.navigation-next > a');
        // if(this._page === 0) {
        //     prev.addClass('disabled');
        // } else {
        //     prev.removeClass('disabled');
        // }
        // if(this._page * this._rows * this._cols + this._shownCount < this._totalAvailable) {
        //     next.removeClass('disabled');
        // } else {
        //     next.addClass('disabled');
        // }
        // hide busy spinner
        // uow.ui.hideBusy(this._busy);
    },
    
    _onError: function(err) {
        console.error('error', err);
    },
    
    _onClickNext: function(event) {
        if(!dojo.hasClass(event.target, 'disabled')) {
            this._page += 1;
            this._search();
        }
        dojo.stopEvent(event);
    }
});