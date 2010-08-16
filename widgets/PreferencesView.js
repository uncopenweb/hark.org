/*
 *  PreferencesView.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.PreferencesView');
dojo.require('org.hark.Preferences');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'PreferencesView');

dojo.declare('org.hark.PreferencesView', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark', 'templates/PreferencesView.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark','PreferencesView');
        this._prefs = org.hark.Preferences;
    },
    
    _onMousePref: function(value) {
        this._prefs.mouseEnabled = value;
        dojo.publish('/org/hark/prefs/request', ['mouseEnabled']);
    },
    
    _onSpeechPref: function(value) {
        this._prefs.speechEnabled = value;
        dojo.publish('/org/hark/prefs/request', ['speechEnabled']);
    },
    
    _onVolumePref: function(value) {
        this._prefs.volume = Math.max(value, 0.05);
        dojo.publish('/org/hark/prefs/request', ['volume']);        
    },
    
    _onSpeechVolumePref: function(value) {
        this._prefs.speechVolume = Math.max(value, 0.05);
        dojo.publish('/org/hark/prefs/request', ['speechVolume']);                
    },
    
    _onSoundVolumePref: function(value) {
        this._prefs.soundVolume = Math.max(value, 0.05);
        dojo.publish('/org/hark/prefs/request', ['soundVolume']);
    },
    
    _onMusicVolumePref: function(value) {
        this._prefs.musicVolume = Math.max(value, 0.05);
        dojo.publish('/org/hark/prefs/request', ['musicVolume']);        
    }
});