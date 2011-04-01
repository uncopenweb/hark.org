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
        // current page regard
        this._pageIndex = 0;
    },
    
    postCreate: function() {
        // get current page name
        var path = window.location.pathname;
        var segs = path.split('/');
        var page = segs[segs.length-1] || 'index.html';

        // populate links
        dojo.forEach(this.labels.pages, function(item) {
            var a = dojo.create('a', {
                href : item[0],
                innerHTML : item[1]
            }, this.idleNode, 'last');
            if(page === item[0]) {
                // show the active page as selected
                dojo.addClass(a, 'selected');
            }
        }, this);

        if(page === 'play.html') {
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
        } else if(page === 'index.html') {
            // enable key navigation of pages
            dojo.subscribe('/uow/key/down', this, '_onKeyDown');
        }
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
    
    _onClickQuit: function(event) {
        dojo.publish('/org/hark/ctrl/leave-page', [this]);
        dojo.stopEvent(event);
    },

    _onKeyDown: function(event) {
        // avoid conflict with site-wide hotkeys
        if(event[org.hark.modifier]) { return; }
        var item, args, wrap;
        switch(event.keyCode) {
            case dojo.keys.UP_ARROW:
                dojo.stopEvent(event);
                item = this.labels.pages[this._pageIndex];
                args = [this, item[0], item[1]];
                dojo.publish('/org/hark/ctrl/select-page', args);
                break;
            case dojo.keys.DOWN_ARROW:
                dojo.stopEvent(event);
                item = this.labels.pages[this._pageIndex];
                args = [this, item[0], item[1]];
                dojo.publish('/org/hark/ctrl/regard-page', args);
                break;
            case dojo.keys.LEFT_ARROW:
                dojo.stopEvent(event);
                this._pageIndex -= 1;
                if(this._pageIndex < 0) {
                    this._pageIndex = this.labels.pages.length - 1;
                    wrap = true;
                }
                item = this.labels.pages[this._pageIndex];
                args = [this, item[0], item[1]];
                if(wrap) {
                    dojo.publish('/org/hark/ctrl/regard-page/last', args);
                }
                dojo.publish('/org/hark/ctrl/regard-page', args);
                break;
            case dojo.keys.RIGHT_ARROW:
                dojo.stopEvent(event);
                this._pageIndex += 1;
                if(this._pageIndex >= this.labels.pages.length) {
                    this._pageIndex = 0;
                    wrap = true;
                }
                item = this.labels.pages[this._pageIndex];
                args = [this, item[0], item[1]];
                if(wrap) {
                    dojo.publish('/org/hark/ctrl/regard-page/first', args);
                }
                dojo.publish('/org/hark/ctrl/regard-page', args);
                break;
        }        
    }
});