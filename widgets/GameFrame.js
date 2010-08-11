/*
 *  GameFrame.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.GameFrame');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.Toolbar');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.Slider');
dojo.require('dijit.TitlePane')
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
        // toolbar blur timeout
        this._blurTok = null;
        this.labels = dojo.i18n.getLocalization('org.hark','GameFrame');
    },

    postCreate: function() {
        // listen to focus / blur on all toolbar children
        var children = this.toolbar.getChildren();
        dojo.forEach(children, function(child) {
            this.connect(child.focusNode, 'onfocus', '_onChildFocus');
            this.connect(child.focusNode, 'onblur', '_onChildBlur');
        }, this);
        // and the pref dialog
        this.connect(this.prefDialog.containerNode, 'onfocus', '_onChildFocus');
        // and its descendant widgets too
        dojo.query('[widgetId]', this.prefDialog.containerNode).forEach(function(node) {
            console.log(node);
            var child = dijit.byNode(node);
            this.connect(child.focusNode, 'onfocus', '_onChildFocus');
            this.connect(child.focusNode, 'onblur', '_onChildBlur');
        }, this);
        // and the title pane container
        this.connect(this.titlePane.containerNode, 'onfocus', '_onChildFocus');
        this.connect(this.titlePane.containerNode, 'onblur', '_onChildBlur');
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
        if(!this._busy) {
            this._onToolbarFocus();
        }
        clearTimeout(this._blurTok);
        dojo.addClass(this.toolbar.domNode, 'dijitToolbarFocused');
    },
    
    _onChildBlur: function(event) {
        // set timer to return focus to game
        this._blurTok = setTimeout(dojo.hitch(this, '_onToolbarBlur'), 250); 
    },
    
    _onToolbarFocus: function(event) {
        if(this._busy) {
            org.hark.BusyOverlay.hide(this._busy);
        }
        // @todo: need to signal game to stop too
        this._busy = org.hark.BusyOverlay.show({
            busyNode: this.frameNode,
            parentNode: this.framePane.domNode,
            takeFocus: false,
            animate: false,
            message : this.labels.paused_overlay_label
        });
        // @todo: should probably disconnect sooner?
        this.connect(this._busy.domNode, 'onfocus', '_onToolbarBlur');
    },
    
    _onToolbarBlur: function() {
        dojo.removeClass(this.toolbar.domNode, 'dijitToolbarFocused');
        this.frameNode.focus();
        if(this._busy) {
            org.hark.BusyOverlay.hide(this._busy);
            this._busy = null;
        }
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