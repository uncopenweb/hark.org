/**
 * Search view widget.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.SearchView');
dojo.require('dijit.form.Button');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'SearchView');

dojo.declare('org.hark.SearchView', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.templates', 'SearchView.html'),
    
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark', 'SearchView');
    },
    
    postCreate: function() {
        // trigger a search on page load
        dojo.ready(this, '_onClickSearch');
    },
    
    _onKeyUp: function(event) {
        if(event.keyCode == dojo.keys.ENTER) {
            this._onClickSearch();
        }
    },
    
    _onClickSearch: function() {
        this.onSearch(this.textBox.value);
    },
    
    _onClickReset: function() {
        this.textBox.value = '';
        this._onClickSearch();
    },
    
    onSearch: function(text) {
        // extension point
        dojo.publish('/hark/search', [text]);
    }
});
