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
        // game list model
    model : '',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.widgets', 'templates/GameFrame.html'),
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark.widgets','GameFrame');
        this.model = dijit.byId(this.model);
        // connect tokens for event handlers
        this._connectTokens = [];
        // subscribe tokens for pub/sub
        this._subTokens = [];
        // busy overlay
        this._busy = null;
        // toolbar blur timeout
        this._blurTok = null;
        // is the game paused?
        this._paused = false;
    },

    /* Configure focus and key tracking on critical nodes */ 
    postCreate: function() {
        // listen for game selection
        dojo.subscribe('/org/hark/ctrl/select-game', this, '_onSelectGame');
        dojo.subscribe('/org/hark/ctrl/unselect-game', this, '_onUnselectGame');

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
            var child = dijit.byNode(node);
            if(child.focusNode) {
                this.connect(child.focusNode, 'onfocus', '_onChildFocus');
                this.connect(child.focusNode, 'onblur', '_onChildBlur');
            }
        }, this);
        // and the title pane container
        this.connect(this.prefView.titlePane.containerNode, 'onfocus', '_onChildFocus');
        this.connect(this.prefView.titlePane.containerNode, 'onblur', '_onChildBlur');
        
        // listen for tab nav in the toolbar
        this.connect(this.toolbar.domNode, 'onkeydown', '_onKeyDown');
        // listen for magic keys in toolbar
        this.connect(this.toolbar.domNode, 'onkeyup', '_onKeyUp');
    },
    
    /* Load a new game in the iframe. */
    _onSelectGame: function(ctrl, item) {
        org.hark.disconnectKeys();
        
        dojo.style(this.domNode, 'display', '');
        this.frameNode.src = ROOT_PATH + item.url;
        
        // force a resize
        this.borderContainer.resize();
        
        // reset busy dialog
        if(this._busy) {
            uow.ui.BusyOverlay.hide(this._busy);
            this._busy = null;
        }
    },
    
    /* Hide the game frame and unload the game. */
    _onUnselectGame: function() {
        org.hark.connectKeys();
        
        dojo.style(this.domNode, 'display', 'none');
        this.frameNode.src = 'about:blank';

        // reset busy dialog
        if(this._busy) {
            uow.ui.BusyOverlay.hide(this._busy);
            this._busy = null;
        }
    },
    
    /* Clear blur timer and set focus style on toolbar. */
    _onChildFocus: function(event) {
        if(!this._busy) {
            this._onToolbarFocus();
        }
        clearTimeout(this._blurTok);
        dojo.addClass(this.toolbar.domNode, 'dijitToolbarFocused');
    },
    
    /* Set a timer to return focus to the game if toolbar doesn't grab it. */
    _onChildBlur: function(event) {
        // set timer to return focus to game
        this._blurTok = setTimeout(dojo.hitch(this, '_onToolbarBlur', event), 250); 
    },
    
    /* Pause the game and give the toolbar focus. */
    _onToolbarFocus: function(event) {
        if(this._busy) {
            uow.ui.BusyOverlay.hide(this._busy);
        }
        this._busy = uow.ui.BusyOverlay.show({
            busyNode: this.frameNode,
            parentNode: this.framePane.domNode,
            takeFocus: false,
            animate: false,
            message : this.labels.paused_overlay_label
        });
        // @todo: should probably disconnect sooner?
        this.connect(this._busy.domNode, 'onfocus', '_onToolbarBlur');
        // update hint
        this.hintNode.innerHTML = this.labels.resume_hint;
        // signal the game to stop
        var win = this.frameNode.contentWindow;
        if(!this._paused && win.dojo) {
            win.dojo.publish('/org/hark/pause', [true]);
            this._paused = true;
        }
    },
    
    /* Unpause the game. */
    _onToolbarBlur: function(event) {
        dojo.removeClass(this.toolbar.domNode, 'dijitToolbarFocused');
        if(this._blurTok) {
            clearTimeout(this._blurTok);
            this._blurTok = null;
        }
        if(this._busy) {
            uow.ui.BusyOverlay.hide(this._busy);
            this._busy = null;
        }
        // delay to grab focus from the busy
        setTimeout(dojo.hitch(this.frameNode, 'focus'), 100);
        // update hint
        this.hintNode.innerHTML = this.labels.pause_hint;
        // signal the game to resume
        var win = this.frameNode.contentWindow;
        if(this._paused && win.dojo) {
            win.dojo.publish('/org/hark/pause', [false]);
            this._paused = false;
        }
    },

    /* Connect for key events and publishes from the game in the frame. */
    _onFrameLoad: function(event) {
        var cw = event.target.contentWindow;
        if(dojo.isSafari) {
            // safari fails to set the hash for some reason, so force it here
            cw.location.hash = event.target.src.split('#')[1];
        }
        if(this._connectTokens.length) {
            dojo.forEach(this._connectTokens, dojo.disconnect);
            this._connectTokens = [];
            dojo.forEach(this._subTokens, dojo.unsubscribe);
            this._subTokens = [];
        }
        var t;
        t = dojo.connect(cw, 'onkeyup', this, '_onKeyUp');
        this._connectTokens.push(t);
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
        this.frameNode.focus();
    },
    
    /* Eat tab events for navigation out of the toolbar or iframe. */
    _onKeyDown: function(event) {
        if(event.keyCode == dojo.keys.TAB) {
            // stop tab from getting us out of the game
            dojo.stopEvent(event);
        }
    },
    
    /* Watch for magic hotkey to activate / deactivate the toolbar. */
    _onKeyUp: function(event) {
        if(event.keyCode == dojo.keys.ESCAPE && event.shiftKey) {
            if(this._busy) {
                // move focus back to the game frame
                this._onToolbarBlur();
            } else {
                // move focus to toolbar
                this.toolbar.focus();
                dojo.stopEvent(event);
            }
        }
    },
    
    /* Publish game quit. */
    _onClickHome: function(event) {
        dojo.publish('/org/hark/ctrl/unselect-game', [this]);
    },
    
    /* Publish preferences for the game. */
    _onPrefRequest: function(name) {
        var win = this.frameNode.contentWindow;
        win.dojo.publish('/org/hark/prefs/response', 
            [org.hark.widgets.Preferences, name]);
    }
});