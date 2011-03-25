/**
 * Site-wide keyboard controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.SiteKeys');
dojo.require('org.hark.widgets.Preferences');
dojo.require('dijit._Widget');

dojo.declare('org.hark.widgets.SiteKeys', [dijit._Widget], {
    postMixInProperties: function() {
        this._prefs = org.hark.widgets.Preferences;
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/uow/key/down', this, '_onKeyDown');
    },
    
    _onKeyDown: function(event) {
        if(event.shiftKey) {
            if(event.keyCode === dojo.keys.ESCAPE) {
                dojo.publish('/org/hark/ctrl/unselect-game', [this]);
                dojo.stopEvent(event);
            } else if(event.keyCode === dojo.keys.UP_ARROW) {
                this._prefs.volume = Math.min(this._prefs.volume + 0.05, 1.0);
                dojo.publish('/org/hark/prefs/request', ['volume']);
                dojo.stopEvent(event);
            } else if(event.keyCode === dojo.keys.DOWN_ARROW) {
                this._prefs.volume = Math.max(this._prefs.volume - 0.05, 0.05);
                dojo.publish('/org/hark/prefs/request', ['volume']);
                dojo.stopEvent(event);
            } else if(event.keyCode === dojo.keys.RIGHT_ARROW) {
                // @todo: rate
                dojo.stopEvent(event);
            } else if(event.keyCode === dojo.keys.LEFT_ARROW) {
                // @todo: rate
                dojo.stopEvent(event);
            }
        }
    }
});