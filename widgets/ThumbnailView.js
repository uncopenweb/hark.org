/**
 * Thumbnail list view widget.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.ThumbnailView');
dojo.require('dojo.cache');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.Button');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'ThumbnailView');

dojo.declare('org.hark.ThumbnailView', [dijit._Widget, dijit._Templated], {
    // data mode
    model: null,
    // results per row
    rowSize: 6,
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.templates', 'ThumbnailView.html'),

    postMixInProperties: function() {
        // query template
        this._queryTemplate = 'label: *{text}* OR description: *{text}*';
        // current results on page
        this._shownCount = 0;
        // current page
        this._page = 0;
        this.labels = dojo.i18n.getLocalization('org.hark', 'ThumbnailView');
        this.subscribe('/search', 'setQuery');
    },
    
    postCreate: function() {
    },
    
    resize: function(box) {
        this.containerNode.resize(box);
    },
    
    setQuery: function(text) {
        this._query = text;
        this._search();
    },
    
    _onNextPage: function() {
        console.log('_onNextPage');
        this._page += 1;
        this._search();
    },
    
    _onPrevPage: function() {
        this._page -= 1;
        this._search();        
    },
    
    _search: function() {
        // build the query
        var q = dojo.replace(this._queryTemplate, {text : this._query});
        var req = this.model.fetch({
            query: {complexQuery : q},
            onBegin: this._onBegin,
            onItem: this._onItem,
            onComplete: this._onComplete,
            onError: this._onError,
            start: this._page * this.rowSize,
            // fetch one extra to check if there's a next
            count: this.rowSize + 1,
            queryOptions: {
                deep: false,
                ignoreCase: true
            },
            sort : {
                attribute : 'label',
                descending : true
            },
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
                var html = dojo.replace(tmpl, {
                    game_href :  ROOT_PATH + this.model.getValue(item, 'path'),
                    game_label : this.model.getValue(item, 'label'),
                    icon_src : ROOT_PATH + this.model.getValue(item, 'media').icon,
                    icon_alt : this.model.getValue(item, 'label'),
                    more_href : '#'+this.model.getValue(item, 'hash'),
                    more_label : this.labels.more_info_label
                });
                td.innerHTML = html;
                dojo.addClass(td, 'harkThumbnailViewActiveCell');
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
    },
    
    _onError: function(err) {
        console.error('error', err);
    }
});
