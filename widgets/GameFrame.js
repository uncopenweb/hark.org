/*
 *  GameFrame.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.GameFrame');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.Toolbar');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'GameFrame');

dojo.declare('org.hark.GameFrame', [dijit._Widget, dijit._Templated], {
    // game url
    url: '',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark', 'templates/GameFrame.html'),

    postMixInProperties: function() {
        // tokens for event handlers
        this._tokens = [];
        // busy overlay
        this._busy = null;
        this.labels = dojo.i18n.getLocalization('org.hark','GameFrame');
    },

    postCreate: function() {
        // listen to focus / blur on all toolbar children
        dojo.forEach(this.toolbar.getChildren(), function(child) {
            this.connect(child.focusNode, 'onfocus', '_onChildFocus');
            this.connect(child.focusNode, 'onblur', '_onChildBlur');
        }, this);
    },
    
    _setUrlAttr: function(url) {
        this.url = url;
        var display, src;
        if(this.url) {
            display = '';
            src = this.url;
        } else {
            display = 'none';
            src = 'about:blank';
        }
        dojo.style(this.domNode, 'display', display);
        this.frameNode.src = src;
        
        // force a resize
        this.borderContainer.resize();
        
        // reset busy dialog
        if(this._busy) {
            org.hark.BusyOverlay.hide(this._busy);
            this._busy = null;
        }
    },
    
    _onChildFocus: function(event) {
        dojo.addClass(this.toolbar.domNode, 'dijitToolbarFocused');
    },
    
    _onChildBlur: function(event) {
        dojo.removeClass(this.toolbar.domNode, 'dijitToolbarFocused');
    },
    
    _onToolbarFocus: function(event) {
        if(this._busy) {
            org.hark.BusyOverlay.hide(this._busy);
        }
        // @todo: show paused message with icon
        // @todo: need to signal game to stop too
        this._busy = org.hark.BusyOverlay.show({
            busyNode: this.frameNode,
            parentNode: this.framePane.domNode,
            takeFocus: false
        });
    },
    
    _onFrameFocus: function(event) {
        // @todo: doesn't get called, need another way to hide busy
        org.hark.BusyOverlay.hide(this._busy);
        this._busy = null;
    },

    _onFrameLoad: function(event) {
        if(this._tokens.length) {
            dojo.forEach(this._tokens, dojo.disconnect);
            this._tokens = [];
        }
        var t;
        t = dojo.connect(event.target.contentWindow, 'onkeyup', this, 
            '_onKeyUp');
        this._tokens.push(t);
        t = dojo.connect(event.target.contentWindow, 'onkeydown', this, 
            '_onKeyDown');
        this._tokens.push(t);
    },
    
    _onKeyDown: function(event) {
        if(event.keyCode == dojo.keys.TAB) {
            // stop tab from getting us out of the game
            dojo.stopEvent(event);
        }
    },
    
    _onKeyUp: function(event) {
        if(event.keyCode == dojo.keys.ESCAPE && event.shiftKey) {
            // move focus to toolbar
            this.toolbar.focus();
            dojo.stopEvent(event);
        }
    },
    
    _onClickHome: function(event) {
        // switch hash to leave the game
        dojo.hash('#');
    }
});