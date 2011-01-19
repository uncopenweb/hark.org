/**
 * Site navigation tabs.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.SiteTabs');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'SiteTabs');

dojo.declare('org.hark.SiteTabs', [dijit._Widget, dijit._Templated], {
    selected : 0,
    widgetsInTemplate: false,
    templateString: dojo.cache('org.hark', 'templates/SiteTabs.html'),
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark','SiteTabs');
    },

    _setSelectedAttr: function(selected) {
        var nodes = dojo.query('a', this.domNode);
        try {
            dojo.removeClass(nodes[this.selected], 'selected');
        } catch(e) {}
        this.selected = selected;
        try {
            dojo.addClass(nodes[this.selected], 'selected');
        } catch(e) {}
    }
});