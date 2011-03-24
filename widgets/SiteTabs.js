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
    widgetsInTemplate: false,
    templateString: dojo.cache('org.hark.widgets', 'templates/SiteTabs.html'),
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark.widgets','SiteTabs');
        // game paused?
        this._paused = false;        
    },
    
    postCreate: function() {
        var path = window.location.pathname;
        var segs = path.split('/');
        var page = segs[segs.length-1] || 'index.html';
        // show the active page as selected
        var nodes = dojo.query('a[href="'+page+'"]', this.domNode)
            .addClass('selected');

        if(page !== 'play.html') {
            // not playing a game, no dynamic behavior
            return;
        }

        // listen for pause/unpause events
        dojo.subscribe('/org/hark/ctrl/pause-game', this, '_onPauseGame');
        dojo.subscribe('/org/hark/ctrl/unpause-game', this, '_onUnpauseGame');
        
        // get ref to parent bar containing this widget
        this.barNode = this.domNode.parentNode;
        
        // watch for mouse activity in parent node to pause game
        this.connect(this.barNode, 'onclick', '_onClickParent');

        // show play options
        dojo.style(this.playingNode, 'display', '');
        dojo.style(this.idleNode, 'display', 'none');            
    },

    _onPauseGame: function(ctrl, target) {
        this._paused = true;
    },
    
    _onUnpauseGame: function() {
        this._paused = false;
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