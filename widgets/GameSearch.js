/**
 * Game search combobox.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameSearch');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.ComboBox');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'GameSearch');

dojo.declare('org.hark.widgets.GameSearch', [dijit._Widget, dijit._Templated], {
    // game list model
    model : '',
    widgetsInTemplate: true,
    templateString: dojo.cache('org.hark.widgets', 'templates/GameSearch.html'),
    postMixInProperties: function() {
        this._labels = dojo.i18n.getLocalization('org.hark.widgets','GameSearch');
        this.model = dijit.byId(this.model);
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/org/hark/db/tags', this, '_onTagsDb');
        dojo.subscribe('/org/hark/ctrl/regard-tag', this, '_onRegardTag');
    },
    
    _onTagsDb: function(db) {
        this.searchBox.attr('disabled', false);
        this.searchBox.attr('store', db);
        this.searchBox.attr('query', {lang : this._locale});
    },
    
    _onRegardTag: function(ctrl, tag, index, total) {
        this.searchBox.attr('value', tag);
    },
        
    _onSearch: function(text) {
        this.model.newSearch(text);
    },
    
    _onFocus: function() {
        // disable global key catch
        try {
            uow.ui.disconnectKeys();
        } catch(e) {
            return;
        }
        this._reconnectKeys = true;
    },
    
    _onBlur: function() {
        // enable global key catch if it was enabled
        if(this._reconnectKeys) {
            try {
                uow.ui.connectKeys();
            } catch(e) {}
            this._reconnectKeys = false;
        }
    }
});

org.hark.widgets.GameSearch.formatLabel = function(item, store) {
    return item.name;
};
