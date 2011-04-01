/**
 * Site nav audio output.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.SiteAudio');
dojo.require('dijit._Widget');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'SiteAudio');

dojo.declare('org.hark.widgets.SiteAudio', [dijit._Widget], {
    postMixInProperties: function() {
        this._labels = dojo.i18n.getLocalization('org.hark.widgets', 'SiteAudio');
        // track if keys ready
        this._keysReady = false;
        // audio interface
        this._audio = null;
        uow.getAudio().then(dojo.hitch(this, function(a) {
            this._audio = a;
            if(this._keysReady) {
                this._onKeysReady();
            }
        }), function() {
            // @todo: fail gracefully
        });
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/ctrl/keys-ready', this, '_onKeysReady');
        dojo.subscribe('/org/hark/ctrl/select-page', this, '_onSelectPage');
        dojo.subscribe('/org/hark/ctrl/regard-page', this, '_onRegardPage');
        dojo.subscribe('/org/hark/ctrl/regard-page/first', this, '_onRegardWrapPage');
        dojo.subscribe('/org/hark/ctrl/regard-page/last', this, '_onRegardWrapPage');
    },

    _onKeysReady: function() {
        this._keysReady = true;
        // watch for immediate game select before audio is ready
        if(!this._audio) {return;}
        this._audio.stop({channel : 'sound'});
        this._audio.play({
            channel : 'sound', 
            url : this._labels.ready_sound
        });
    },
    
    _onSelectPage: function() {
        console.log('select page', arguments);
    },
    
    _onRegardPage: function() {
        console.log('regard page', arguments);
    },
    
    _onRegardWrapPage: function() {
        console.log('wrap page', arguments);
    }
});