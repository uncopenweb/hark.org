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
        console.log('begin', size);
        // clear the table cells
        dojo.query('td', this.tableNode).forEach('dojo.destroy(item);');
        // @todo: show message if no results
    },
    
    _onItem: function(item) {
        console.log(item);
        var td = dojo.create('td', null, this.row0);
        var img = dojo.create('img', {
            src : this.model.getValue(item, 'media').icon
        }, td);
        dojo.create('br', null, td);
        var span = dojo.create('a', {
            href : '#'+this.model.getValue(item, 'hash'),
            innerHTML : this.model.getValue(item, 'label')
        }, td);
    },
    
    _onComplete: function() {
        console.log('complete');
        
    },
    
    _onError: function(err) {
        console.error('error', err);
    }
});
