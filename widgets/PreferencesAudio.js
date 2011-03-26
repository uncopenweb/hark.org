/*
 *  PreferencesAudio.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.widgets.PreferencesAudio');
dojo.require('org.hark.widgets.Preferences');
dojo.require('dijit._Widget');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'PreferencesAudio');

dojo.declare('org.hark.widgets.PreferencesAudio', [dijit._Widget], {
    postMixInProperties: function() {
        this._labels = dojo.i18n.getLocalization('org.hark.widgets','PreferencesAudio');
        this._prefs = org.hark.widgets.Preferences;
        uow.getAudio().then(dojo.hitch(this, function(a) {
            this._audio = a;
            // set the current preferences
            this._onPrefChange('volume', true);
            this._onPrefChange('speechVolume', true);
            this._onPrefChange('soundVolume', true);
            this._onPrefChange('speechRate', true);
        }), function() {
            // @todo: fail gracefully
        });
    },

    postCreate: function() {
        this.subscribe('/org/hark/prefs/request', '_onPrefChange');
    },
    
    _onPrefChange: function(name, quiet) {
        var speech;
        if(!this._audio) {
            return;
        } else if(name === 'volume') {
            this._audio.setProperty({
                name : 'volume', 
                value : this._prefs.volume * this._prefs.speechVolume,
                immediate : true
            });
            this._audio.setProperty({
                channel : 'sound',
                name : 'volume', 
                value : this._prefs.volume * this._prefs.soundVolume,
                immediate : true
            });
            if(!quiet) {
                this._audio.stop();
                this._audio.stop({channel : 'sound'});
                speech = dojo.replace(this._labels.volume_test, 
                    [Math.round(this._prefs.volume * 100)]);
                this._audio.say({text : speech});
                this._audio.play({
                    channel : 'sound', 
                    url : this._labels.sound_test
                });
            }            
        } else if(name === 'speechVolume') {
            this._audio.setProperty({
                name : 'volume', 
                value : this._prefs.volume * this._prefs.speechVolume,
                immediate : true
            });
            if(!quiet) {
                this._audio.stop();
                // say example utterance
                speech = dojo.replace(this._labels.volume_test, 
                    [Math.round(this._prefs.volume * 100)]);
                this._audio.say({text : speech});
            }
        } else if(name === 'soundVolume') {
            this._audio.setProperty({
                channel : 'sound',
                name : 'volume', 
                value : this._prefs.volume * this._prefs.soundVolume,
                immediate : true
            });
            if(!quiet) {
                // play example sound
                this._audio.stop({channel : 'sound'});
                this._audio.play({
                    channel : 'sound', 
                    url : this._labels.sound_test
                });
            }
        } else if(name === 'speechRate') {
            this._audio.setProperty({
                name : 'rate', 
                value : this._prefs.speechRate,
                immediate : true
            });
            if(!quiet) {
                this._audio.stop();
                // say example utterance
                speech = dojo.replace(this._labels.rate_test,
                    [Math.round(this._prefs.speechRate)]);
                this._audio.say({text : speech});
            }
        }
    }
});