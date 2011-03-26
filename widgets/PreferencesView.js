/*
 *  PreferencesView.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.widgets.PreferencesView');
dojo.require('org.hark.widgets.Preferences');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.Slider');
dojo.require('dijit.TitlePane')
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'PreferencesView');

dojo.declare('org.hark.widgets.PreferencesView', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.widgets', 'templates/PreferencesView.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark.widgets','PreferencesView');
        this._prefs = org.hark.widgets.Preferences;
    },
    
    postCreate: function() {
        // set non-defaults
        for(var name in this._prefs) {
            var val = this._prefs[name];
            // yea, still works for bools for now
            var w = this[name+'Widget'];
            if(w) {
                if(val <= 1.0) {
                    // percentages
                    val *= 100;
                }
                w.attr('value', val);
            }
        }
    },
    
    _onMousePref: function(value) {
        this._prefs.mouseEnabled = value;
        dojo.publish('/org/hark/prefs/request', ['mouseEnabled']);
    },
    
    _onSpeechPref: function(value) {
        this._prefs.speechEnabled = value;
        dojo.publish('/org/hark/prefs/request', ['speechEnabled']);
    },
    
    _onSpeechRatePref: function(value) {
        this._prefs.speechRate = value;
        dojo.publish('/org/hark/prefs/request', ['speechRate']);        
    },
    
    _onVolumePref: function(value) {
        this._prefs.volume = Math.max(value/100, 0.05);
        dojo.publish('/org/hark/prefs/request', ['volume']);        
    },
    
    _onSpeechVolumePref: function(value) {
        this._prefs.speechVolume = Math.max(value/100, 0.05);
        dojo.publish('/org/hark/prefs/request', ['speechVolume']);                
    },
    
    _onSoundVolumePref: function(value) {
        this._prefs.soundVolume = Math.max(value/100, 0.05);
        dojo.publish('/org/hark/prefs/request', ['soundVolume']);
    },
    
    _onMusicVolumePref: function(value) {
        this._prefs.musicVolume = Math.max(value/100, 0.05);
        dojo.publish('/org/hark/prefs/request', ['musicVolume']);        
    }
});