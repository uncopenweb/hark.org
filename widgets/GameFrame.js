/*
 *  GameFrame.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.widgets.GameFrame');
dojo.require('org.hark.widgets.Preferences');
dojo.require('org.hark.widgets.PreferencesView');
dojo.require('uow.ui.BusyOverlay');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.Toolbar');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.Slider');
dojo.require('dijit.TitlePane')
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'GameFrame');

dojo.declare('org.hark.widgets.GameFrame', [dijit._Widget, dijit._Templated], {
    // game list model
    model : '',
    widgetsInTemplate: true,
    templateString: '<div class="harkGameFrame"></div>',
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark.widgets','GameFrame');
        this.model = dijit.byId(this.model);
        // connect tokens for event handlers
        this._connectTokens = [];
        // subscribe tokens for pub/sub
        this._subTokens = [];
        // busy overlay
        this._busy = null;
        // busy overlay connection
        this._busyTok = null;
        // is the game paused?
        this._paused = false;
        // is there a game active?
        this._playing = true;        
    },

    /* Listen for controller events. */ 
    postCreate: function() {
        dojo.subscribe('/org/hark/ctrl/select-game', this, '_onSelectGame');
        dojo.subscribe('/org/hark/ctrl/unselect-game', this, '_onUnselectGame');
        dojo.subscribe('/org/hark/ctrl/pause-game', this, '_onPauseGame');
        dojo.subscribe('/org/hark/ctrl/unpause-game', this, '_onUnpauseGame');
    },
    
    /* Load a new game in the iframe. */
    _onSelectGame: function(ctrl, item) {
        this._playing = true;
        
        // stop other components from intercepting keys
        org.hark.disconnectKeys();
        
        // watch for magic keys on window
        var t = dojo.connect(window, 'onkeydown', this, '_onKeyDown');
        this._connectTokens.push(t);
        
        // show the game frame and load the game
        dojo.style(this.domNode, 'display', '');
        // create a new iframe to avoid polluting browser history
        var iframe = this.frameNode = dojo.create('iframe', {}, this.domNode);
        var tok = dojo.connect(this.frameNode, 'onload', this, '_onLoadFrame');
        this._connectTokens.push(tok);
        var src = org.hark.rootPath + item.url;
        // async else it doesn't load
        setTimeout(function() {iframe.src = src;}, 0);
        
        // reset busy overlay
        if(this._busy) {
            uow.ui.BusyOverlay.hide(this._busy);
            this._busy = null;
            dojo.disconnect(this._busyTok);
        }
    },
    
    /* Hide the game frame and unload the game. */
    _onUnselectGame: function() {
        this._playing = false;

        // disconnect all keys
        if(this._connectTokens.length) {
            dojo.forEach(this._connectTokens, dojo.disconnect);
            this._connectTokens = [];
            dojo.forEach(this._subTokens, dojo.unsubscribe);
            this._subTokens = [];
        }

        // hide the game frame and unload the game
        dojo.style(this.domNode, 'display', 'none');

        // allow other components to get keystrokes
        org.hark.connectKeys();

        // reset busy dialog
        if(this._busy) {
            uow.ui.BusyOverlay.hide(this._busy);
            this._busy = null;
            dojo.disconnect(this._busyTok);
        }

        dojo.destroy(this.frameNode);
        this.frameNode = null;
    },
    
    /* Resume the game. */
    _onFocusBusy: function() {
        dojo.publish('/org/hark/ctrl/unpause-game', [this]);
    },
    
    /* Pause the game. */
    _onPauseGame: function(event) {
        if(this._busy) {
            uow.ui.BusyOverlay.hide(this._busy);
        }
        this._busy = uow.ui.BusyOverlay.show({
            busyNode: this.frameNode,
            parentNode: this.domNode,
            takeFocus: false,
            animate: false,
            message : this.labels.paused_overlay_label,
            delayShow : 0
        });
        this._busyTok = dojo.connect(this._busy.domNode, 'onfocus', this, 
            '_onFocusBusy');
        if(this.frameNode) {
            // signal the game to stop
            var win = this.frameNode.contentWindow;
            if(!this._paused && win && win.dojo) {
                win.dojo.publish('/org/hark/pause', [true]);
                this._paused = true;
            }
        }
    },
    
    /* Unpause the game. */
    _onUnpauseGame: function(event) {
        if(this._busy) {
            uow.ui.BusyOverlay.hide(this._busy);
            this._busy = null;
        }
        // signal the game to resume
        var win = this.frameNode.contentWindow;
        if(this._paused && win.dojo) {
            win.dojo.publish('/org/hark/pause', [false]);
            this._paused = false;
        }
        // set focus on the iframe
        setTimeout(dojo.hitch(this, function() {
            this.frameNode.focus();
        }), 0);
    },

    /* Connect for key events and publishes from the game in the frame. */
    _onLoadFrame: function(event) {
        var cw = event.target.contentWindow;
        if(dojo.isSafari) {
            // safari fails to set the hash for some reason, so force it here
            cw.location.hash = event.target.src.split('#')[1];
        }
        var t;
        t = dojo.connect(cw, 'onkeydown', this, '_onKeyDown');
        this._connectTokens.push(t);
        // listen for pref requests from within the game frame and externally
        // from the preference controls
        if(cw.dojo) {
            t = dojo.subscribe('/org/hark/prefs/request', this, '_onPrefRequest');
            this._subTokens.push(t);
            t = cw.dojo.subscribe('/org/hark/prefs/request', this, '_onPrefRequest');
            this._subTokens.push(t);
        }
        // set focus on the iframe
        setTimeout(dojo.hitch(this, function() {
            this.frameNode.focus();
        }), 0);
    },
    
    /* Watch for key events to pause/unpause or nav out of frame. */
    _onKeyDown: function(event) {
        if(event.keyCode === dojo.keys.TAB && !this._paused) {
            // stop tab from getting us out of the game
            dojo.stopEvent(event);
        } else if(event.keyCode === dojo.keys.ESCAPE && event.shiftKey) {
            if(this._paused) {
                this.frameNode.tabIndex = 0;
                dojo.publish('/org/hark/ctrl/unpause-game', [this]);
            } else {
                this.frameNode.tabIndex = -1;
                dojo.publish('/org/hark/ctrl/pause-game', [this]);
                dojo.stopEvent(event);
            }
        }
    },
        
    /* Publish preferences for the game. */
    _onPrefRequest: function(name) {
        var win = this.frameNode.contentWindow;
        win.dojo.publish('/org/hark/prefs/response', 
            [org.hark.widgets.Preferences, name]);
    }
});