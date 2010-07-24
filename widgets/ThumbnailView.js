/**
 * Thumbnail list view widget.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.ThumbnailView');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.Button');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'ThumbnailView');

dojo.declare('org.hark.ThumbnailView', [dijit._Widget, dijit._Templated], {
    model: null,
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.templates', 'ThumbnailView.html'),

    postMixInProperties: function() {
        // current page
        this._currentPage = 0;
        // query template
        this._queryTemplate = 'label: *{text}* OR description: *{text}*';
        // current results on page
        this._results = 0;
        this.labels = dojo.i18n.getLocalization('org.hark', 'ThumbnailView');
        this.subscribe('/search', 'showPage');
    },
    
    postCreate: function() {
        // show the first set of results
        //this.showPage();
    },
    
    resize: function(box) {
        this.containerNode.resize(box);
    },
    
    showPage: function(text) {
        // build the query
        var q = dojo.replace(this._queryTemplate, {text : text});
        var req = this.model.fetch({
            query: {complexQuery : q},
            onBegin: this._onBegin,
            onItem: this._onItem,
            onComplete: this._onComplete,
            onError: this._onError,
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
        // @todo: show message if no results
    },
    
    _onItem: function(item) {
        var row = this.row0;
        if(this._results >= 3) {
            row = this.row1;
        }
        var td = dojo.create('td', null, row);
        if(item) {
            var img = dojo.create('img', {
                src : this.model.getValue(item, 'media').icon
            }, td);
            dojo.create('br', null, td);
            var span = dojo.create('a', {
                href : '#'+this.model.getValue(item, 'hash'),
                innerHTML : this.model.getValue(item, 'label')
            }, td);
        }
        this._results += 1;
    },
    
    _onComplete: function() {
        while(this._results < 6) {
            // fill blank cells
            this._onItem(null);
        }
    },
    
    _onError: function(err) {
        console.error('error', err);
    }
});
