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
    controller: null,
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.templates', 'ThumbnailView.html'),

    postMixInProperties: function() {
        // current page
        this._currentPage = 0;        
        this.labels = dojo.i18n.getLocalization('org.hark', 'ThumbnailView');
    },
    
    postCreate: function() {
        // show the first set of results
        this.showPage();
    },
    
    resize: function(box) {
        this.containerNode.resize(box);
    },
    
    showPage: function() {
        // @todo: is this right?
        var q = {};
        // @todo: account for controller search filter
        q[dojo.locale] = '*';
        var req = this.model.fetch({
            query : q,
            onBegin: this._onClear,
            onComplete: this._onComplete,
            onError: this._onError,
            queryOptions: {
                deep: true
            },
            scope: this
        });
    },
    
    _onClear: function() {
        console.log('clearing');
    },
    
    _onComplete: function(items) {
        console.log(items);
    },
    
    _onError: function(err) {
        console.error('error', err);
    }
});
