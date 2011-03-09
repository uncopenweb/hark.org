/**
 * Site navigation tabs.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.SiteTabs');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'SiteTabs');

dojo.declare('org.hark.widgets.SiteTabs', [dijit._Widget, dijit._Templated], {
    selected : 0,
    widgetsInTemplate: false,
    templateString: dojo.cache('org.hark.widgets', 'templates/SiteTabs.html'),
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark.widgets','SiteTabs');
        // game paused?
        this._paused = false;
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/ctrl/select-game', this, '_onSelectGame');
        dojo.subscribe('/org/hark/ctrl/unselect-game', this, '_onUnselectGame');
        dojo.subscribe('/org/hark/ctrl/pause-game', this, '_onPauseGame');
        dojo.subscribe('/org/hark/ctrl/unpause-game', this, '_onUnpauseGame');
        
        // get ref to parent bar containing this widget
        this.barNode = this.domNode.parentNode;
        
        // watch for mouse activity in parent node to pause game
        this.connect(this.barNode, 'onclick', '_onClickParent');
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
    },
    
    _onSelectGame: function() {
        this._paused = false;
        dojo.style(this.playingNode, 'display', '');
        dojo.style(this.idleNode, 'display', 'none');
    },
    
    _onUnselectGame: function() {
        this._paused = false;
        dojo.style(this.playingNode, 'display', 'none');
        dojo.style(this.idleNode, 'display', '');
    },
    
    _onPauseGame: function(ctrl, target) {
        this._paused = true;
        if(ctrl !== this) {
            dojo.query('a', this.playingNode)[0].focus();
        }
        this.hintNode.innerHTML = this.labels.unpause_hint;
    },
    
    _onUnpauseGame: function() {
        this._paused = false;
        this.hintNode.innerHTML = this.labels.pause_hint;
    },
    
    _onClickParent: function(event) {
        if(!this._paused) {
            dojo.publish('/org/hark/ctrl/pause-game', [this]);
        }
    },
    
    _onClickQuit: function() {
        dojo.publish('/org/hark/ctrl/unselect-game', [this]);
    }
});