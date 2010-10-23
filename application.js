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
dojo.require('uow.ui.LoginButton');
dojo.require('org.hark.BusyOverlay');
dojo.require('org.hark.DetailsView');
dojo.require('org.hark.GameFrame');

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
        this.subscribe('/org/hark/model', '_onClickSearch');
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
    constructor: function() {
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
        this.labels = dojo.i18n.getLocalization('org.hark', 'ThumbnailView');
        this.subscribe('/org/hark/search', 'setQuery');
        this.subscribe('/org/hark/model', 'setModel');
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
            this._busy = org.hark.BusyOverlay.show({
                busyNode: this.containerNode.domNode,
                parentNode: this.domNode
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
            start: this._page * this.rowSize,
            // fetch one extra to check if there's a next
            count: this.rowSize + 1,
            sort : [{
                attribute : 'label.'+dojo.locale,
                descending : false
            }],
            scope: this
        });
    },
    
    _onBegin: function(size, request) {
        // clear the table cells
        dojo.query('td', this.tableNode).forEach('dojo.destroy(item);');
        // reset the count
        this._shownCount = 0;
        // @todo: show message if no results
    },
    
    _onItem: function(item) {
        var row = this.row0;
        if(this._shownCount >= this.rowSize / 2.0) {
            row = this.row1;
        }
        if(this._shownCount < this.rowSize) {
            td = dojo.create('td', null, row);
            if(item) {
                var tmpl = dojo.cache('org.hark.templates', 'ThumbnailViewItem.html');
                var url = this._model.getValue(item, 'url');
                var label = this._model.getValue(item, 'label');
                label = label[dojo.locale] || label['en-us'];
                var html = dojo.replace(tmpl, {
                    game_href :  '#' + org.hark.urlToSlug(url),
                    game_label : label,
                    icon_src : ROOT_PATH + this._model.getValue(item, 'media').icon,
                    icon_alt : label,
                    more_href : '#',
                    more_label : this.labels.more_info_label
                });
                td.innerHTML = html;
                dojo.addClass(td, 'harkThumbnailViewActiveCell');
                // listen for image click
                var img = dojo.query('img', td)[0];
                this.connect(img, 'onclick', function() {
                    dojo.hash('#' + org.hark.urlToSlug(url));
                });
                var a = dojo.query('a', td)[1];
                // listen for more info click
                this.connect(a, 'onclick', dojo.partial(this._onMoreInfo, url));
            }
        }
        this._shownCount += 1;
    },
    
    _onComplete: function() {
        while(this._shownCount < this.rowSize) {
            // fill blank cells
            this._onItem(null);
        }
        this.nextButton.attr('disabled', this._shownCount <= this.rowSize);
        this.prevButton.attr('disabled', this._page == 0);
        
        // hide busy spinner
        org.hark.BusyOverlay.hide(this._busy);
    },
    
    _onError: function(err) {
        console.error('error', err);
    },
    
    _onMoreInfo: function(url) {
        dojo.publish('/org/hark/info', [url]);
    }
});

dojo.declare('org.hark.Details', null, {
    constructor: function() {
        // details dialog widget
        this._details = null;
        // listen for more info requests
        dojo.subscribe('/org/hark/info', this, '_onShowDetails');
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
        this._busy = org.hark.BusyOverlay.show({
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
        org.hark.BusyOverlay.hide(this._busy);
    },
    
    _onError: function(err) { 
        console.error(err);
    }    
});

dojo.declare('org.hark.Main', null, {
    constructor: function() {
        // busy dialog overlay
        this._busy = null;
        // connect token for fade in
        this._dlgFadeTok = null;
        
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
        var display = (slug) ? 'none' : '';        
        // show/hide main layout and footer
        var layout = dijit.byId('layout');
        var footer = dijit.byId('footer');
        dojo.style(layout.domNode, 'display', display);
        dojo.style(footer.domNode, 'display', display);
        if(!display) {
            // force a resize
            layout.resize();
            footer.resize();
        } else {
            // clean up any visible details dialog
            var dlg = dijit.byId('dialog');
            dlg.hide();
        }
        // start/stop game
        var url = (slug) ? (ROOT_PATH + org.hark.slugToUrl(slug)) : '';
        var frame = dijit.byId('frame');
        frame.attr('url', url);
    }
});

dojo.ready(function() {
    var app = new org.hark.Main();        
});