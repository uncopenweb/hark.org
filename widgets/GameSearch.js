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
    widgetsInTemplate: true,
    templateString: dojo.cache('org.hark.widgets', 'templates/GameSearch.html'),
    postMixInProperties: function() {
        this._labels = dojo.i18n.getLocalization('org.hark.widgets','GameSearch');
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/org/hark/db/tags', this, 'onModel');
    },
    
    onModel: function(db) {
        this.searchBox.attr('disabled', false);
        this.searchBox.attr('store', db);
        this.searchBox.attr('query', {lang : this._locale});
    },
        
    onSearch: function(text) {
        dojo.publish('/org/hark/search', [text]);
    }
});

org.hark.widgets.GameSearch.formatLabel = function(item, store) {
    return item.name;
};
