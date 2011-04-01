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
        dojo.subscribe('/uow/key/down', this, '_onKeyDown');
    },

    _onKeyDown: function(event) {
        if(event.keyCode === dojo.keys.SHIFT) {
            dojo.publish('/org/hark/ctrl/stop-audio', [this]);
        } else if(event.shiftKey) {
            if(event.keyCode === dojo.keys.ESCAPE) {
                dojo.stopEvent(event);
                dojo.publish('/org/hark/ctrl/leave-page', [this]);
            } else if(event.keyCode === dojo.keys.UP_ARROW) {
                dojo.stopEvent(event);
                this._prefs.volume = Math.min(this._prefs.volume + 0.05, 1.0);
                dojo.publish('/org/hark/prefs/request', ['volume']);
            } else if(event.keyCode === dojo.keys.DOWN_ARROW) {
                dojo.stopEvent(event);
                this._prefs.volume = Math.max(this._prefs.volume - 0.05, 0.05);
                dojo.publish('/org/hark/prefs/request', ['volume']);
            } else if(event.keyCode === dojo.keys.RIGHT_ARROW) {
                dojo.stopEvent(event);
                this._prefs.speechRate = Math.min(this._prefs.speechRate + 20, 400);
                dojo.publish('/org/hark/prefs/request', ['speechRate']);
            } else if(event.keyCode === dojo.keys.LEFT_ARROW) {
                dojo.stopEvent(event);
                this._prefs.speechRate = Math.max(this._prefs.speechRate - 20, 80);
                dojo.publish('/org/hark/prefs/request', ['speechRate']);
            }
        }
    }
});