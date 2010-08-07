/**
 * Thumbnail list view widget.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.ThumbnailView');
dojo.require('org.hark.BusyOverlay');
dojo.require('dojo.cache');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.Button');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'ThumbnailView');

dojo.declare('org.hark.ThumbnailView', [dijit._Widget, dijit._Templated], {
    // results per page
    rowSize: 6,
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.templates', 'ThumbnailView.html'),

    postMixInProperties: function() {
        // current results on page
        this._shownCount = 0;
        // current page
        this._page = 0;
        // busy dialog
        this._busy = null;
        this.labels = dojo.i18n.getLocalization('org.hark', 'ThumbnailView');
        this.subscribe('/search', 'setQuery');
        this.subscribe('/model', 'setModel');
    },
    
    postCreate: function() {
    },
    
    resize: function(box) {
        this.containerNode.resize(box);
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
    
    _onNextPage: function() {
        this._page += 1;
        this._search();
    },

    _onPrevPage: function() {
        this._page -= 1;
        this._search();        
    },
    
    _search: function() {
        // show busy until done
        this._busy = org.hark.BusyOverlay.show({
            busyNode: this.containerNode.domNode,
            parentNode: this.domNode
        });

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
        dojo.publish('/info', [url]);
    }
});
