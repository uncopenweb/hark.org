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
dojo.require('dojo.i18n');
dojo.require('uow.ui.LoginButton');
dojo.require('uow.ui.BusyOverlay');
dojo.require('org.hark.DetailsView');
dojo.require('org.hark.GameFrame');
dojo.requireLocalization('org.hark', 'application');

// root path for all urls
var ROOT_PATH = '../';

org.hark.urlToSlug = function(url) {
    return url.replace(/\//g, '-').replace(/#/g, '>');
};

org.hark.slugToUrl = function(slug) {
    return slug.replace(/\>/g, '#').replace(/-/g, '/');
}

dojo.declare('org.hark.Search', null, {
    constructor: function() {
        // trigger a search whenever a new model is set
        dojo.subscribe('/org/hark/model', this, '_onClickSearch');
        // connect to elements
        this._textNode = dojo.byId('textNode')
        dojo.connect(dojo.byId('searchNode'), 'onclick', this, '_onClickSearch');
        dojo.connect(dojo.byId('resetNode'), 'onclick', this, '_onClickReset');
        dojo.connect(this._textNode, 'onkeyup', this, '_onKeyUp');
    },
    
    _onKeyUp: function(event) {
        if(event.keyCode == dojo.keys.ENTER) {
            this._onClickSearch();
        }
    },
    
    _onClickSearch: function() {
        this.onSearch(this._textNode.value);
    },
    
    _onClickReset: function() {
        this._textNode.value = '';
        this._onClickSearch();
    },
    
    onSearch: function(text) {
        // extension point
        dojo.publish('/org/hark/search', [text]);
    }
});

dojo.declare('org.hark.Results', null, {
    constructor: function(args) {
        // localized labels
        this._labels = args.labels;
        // current results on page
        this._shownCount = 0;
        // current page
        this._page = 0;
        // current database model
        this._model = null;
        // current query for results
        this._query = '';
        // busy dialog
        this._busy = null;
        // container dom node
        this._layoutNode = dojo.byId('layout');
        this._resultsNode = dojo.byId('results');
        this._resultNodes = dojo.query('div[class~="result"]', this._resultsNode);
        // get number of rows and columns
        this._rows = dojo.query('div[class="row"]', this._resultsNode).length;
        this._cols = Math.floor(this._resultNodes.length / this._rows);
        // controller published events
        dojo.subscribe('/org/hark/search', this, 'setQuery');
        dojo.subscribe('/org/hark/model', this, 'setModel');
        // connect to next/previous links
        dojo.query('.navigation-previous > a').onclick(this, '_onClickPrevious');
        dojo.query('.navigation-next > a').onclick(this, '_onClickNext');
    },
    
    setQuery: function(text) {
        this._query = text;
        if(this._model) {
            this._search();
        }
    },
    
    setModel: function(model) {
        this._model = model;
        this._search();
    },
    
    _search: function() {
        if(!this._busy) {
            // show busy until done
            this._busy = uow.ui.BusyOverlay.show({
                busyNode: this._resultsNode,
                parentNode: this._layoutNode,
                takeFocus: false
            });
        }

        // build the query
        var qname = 'label.'+dojo.locale;
        var query = {};
        query[qname] = '*'+this._query+'*';
        // @todo: use $or when gb updates mongo
        var req = this._model.fetch({
            query: query,
            onBegin: this._onBegin,
            onItem: this._onItem,
            onComplete: this._onComplete,
            onError: this._onError,
            start: this._page * this._rows * this._cols,
            // fetch one extra to check if there's a next
            count: this._rows * this._cols,
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
        // clear the table cells
        this._resultNodes.empty('').removeClass('active');
        // reset the count
        this._shownCount = 0;
        // update summary counts
        var start = request.start + 1;
        var end = Math.min(request.start + request.count, size);
        var text = dojo.replace(this._labels.summary_label, 
            [start, end, size]);
        dojo.query('.summary .position', this.resultsNode).forEach('item.innerHTML = "'+text+'"');
    },
    
    _onItem: function(item) {
        var row = Math.floor(this._shownCount / this._cols);
        var col = this._shownCount % this._cols;
        if(item) {
            var tmpl = dojo.cache('org.hark.templates', 'ResultItem.html');
            var url = this._model.getValue(item, 'url');
            var label = this._model.getValue(item, 'label');
            label = label[dojo.locale] || label['en-us'];
            var html = dojo.replace(tmpl, {
                game_href :  '#' + org.hark.urlToSlug(url),
                game_label : label,
                icon_src : ROOT_PATH + this._model.getValue(item, 'media').icon,
                icon_alt : label,
                more_href : '#',
                play_button_label : this._labels.play_button_label
            });
            var node = this._resultNodes[row * this._cols + col];
            dojo.addClass(node, 'active');
            node.innerHTML = html;
            // listen for play button clicks
            var button = dojo.query('button', node)[0];
            dojo.connect(button, 'onclick', function() {
                dojo.hash('#' + org.hark.urlToSlug(url));
            });
            var mi = [dojo.query('a', node)[0], dojo.query('img', node)[0]];
            // listen for more info click
            dojo.forEach(mi, function(item) {
                dojo.connect(item, 'onclick', dojo.hitch(this, '_onMoreInfo', url));
            }, this);
        }
        this._shownCount += 1;
    },
    
    _onComplete: function() {
        var prev = dojo.query('.navigation-previous > a');
        var next = dojo.query('.navigation-next > a');
        if(this._page === 0) {
            prev.addClass('disabled');
        } else {
            prev.removeClass('disabled');
        }
        if(this._page * this._rows * this._cols + this._shownCount < this._totalAvailable) {
            next.removeClass('disabled');
        } else {
            next.addClass('disabled');
        }
        // hide busy spinner
        uow.ui.BusyOverlay.hide(this._busy);
    },
    
    _onError: function(err) {
        console.error('error', err);
    },
    
    _onClickPrevious: function(event) {
        if(!dojo.hasClass(event.target, 'disabled')) {
            this._page -= 1;
            this._search();
        }
        dojo.stopEvent(event);
    },
    
    _onClickNext: function(event) {
        if(!dojo.hasClass(event.target, 'disabled')) {
            this._page += 1;
            this._search();
        }
        dojo.stopEvent(event);
    },
    
    _onMoreInfo: function(url) {
        dojo.publish('/org/hark/info', [url]);
    }
});

dojo.declare('org.hark.Details', null, {
    constructor: function(args) {
        // localized labels
        this._labels = args.labels;
        // details dialog widget
        this._details = null;
        // database instance
        this._db = null;
        // listen for new models
        dojo.subscribe('/org/hark/model', this, 'setModel');
        // listen for more info requests
        dojo.subscribe('/org/hark/info', this, '_onShowDetails');
    },
    
    setModel: function(db) {
        this._db = db;
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
        this._busy = uow.ui.BusyOverlay.show({
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
        var url = this._db.getValue(item, 'url');
        var label = this._db.getValue(item, 'label');
        label = label[dojo.locale] || label['en-us'];
        var description = this._db.getValue(item, 'description');
        description = description[dojo.locale] || description['en-us'];
        var tags = this._db.getValue(item, 'tags');
        tags = tags[dojo.locale] || tags['en-us'];
        
        var game = {
            label : label,
            description : description,
            slug: org.hark.urlToSlug(url),
            tags : tags,
            screenshot : ROOT_PATH + this._db.getValue(item, 'media').screenshots[0],
        };
        // show game details
        this._details = new org.hark.DetailsView({game : game});
        var dlg = dijit.byId('dialog');
        dlg.attr('title', game.label);
        dlg.attr('content', this._details);
        // hide busy overlay
        uow.ui.BusyOverlay.hide(this._busy);
    },
    
    _onError: function(err) { 
        console.error(err);
    }    
});

dojo.declare('org.hark.Main', null, {
    constructor: function(args) {
        // localized labels
        this._labels = args.labels;
        // busy dialog overlay
        this._busy = null;
        // connect token for fade in
        this._dlgFadeTok = null;
        
        // show localized labels
        dojo.query('[data-label]').forEach(function(node) {
            var name = node.getAttribute('data-label');
            node.innerHTML = this._labels[name];
        }, this);
        
        // listen for auth changes
        dojo.subscribe('/uow/auth', this, '_onInitDatabase');
        // listen for hash changes
        dojo.subscribe('/dojo/hashchange', this, '_onHashChange');
        // trigger first login
        dijit.byId('login').triggerLogin();
        var hash = dojo.hash();
        // handle initial hash
        this._onHashChange(hash);
    },
    
    _onInitDatabase: function() {
        this._db = null;

        // get the games database
        var dbDef = uow.getDatabase({
            database : 'harkhome', 
            collection : 'games', 
            mode : 'r'}
        );
        dbDef.addCallback(dojo.hitch(this, '_onDatabaseReady'));        
    },
    
    _onDatabaseReady: function(database) {
        // get database reference
        this._db = database;
        // announce db availability
        dojo.publish('/org/hark/model', [this._db]);
    },
    
    _onHashChange: function(slug) {
        // @todo:
        var display = (slug) ? 'none' : '';        
        // show/hide main layout and footer
        var layout = dojo.byId('layout');
        var footer = dojo.byId('footer');
        dojo.style(layout, 'display', display);
        dojo.style(footer, 'display', display);
        // if(!display) {
        //     // force a resize
        //     layout.resize();
        //     footer.resize();
        // } else {
        // clean up any visible details dialog
        var dlg = dijit.byId('dialog');
        dlg.hide();
        // }
        // start/stop game
        var url = (slug) ? (ROOT_PATH + org.hark.slugToUrl(slug)) : '';
        var game = dijit.byId('game');
        console.log('url:', url);
        game.attr('url', url);
    }
});

dojo.ready(function() {
    var labels = dojo.i18n.getLocalization('org.hark', 'application');
    var args = {
        labels : labels
    };
    details = new org.hark.Details(args);
    search = new org.hark.Search(args);
    results = new org.hark.Results(args);
    main = new org.hark.Main(args);
});