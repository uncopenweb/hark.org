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
        // shortcut to preferences model
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
        if(this._prefs.mouseEnabled === value) {return;}
        this._prefs.mouseEnabled = value;
        dojo.publish('/org/hark/prefs/request', ['mouseEnabled']);
    },
    
    _onSpeechPref: function(value) {
        if(this._prefs.speechEnabled === value) {return;}
        this._prefs.speechEnabled = value;
        dojo.publish('/org/hark/prefs/request', ['speechEnabled']);
    },
    
    _onSpeechRatePref: function(value) {
        if(this._prefs.speechRate === value) {return;}
        this._prefs.speechRate = value;
        dojo.publish('/org/hark/prefs/request', ['speechRate']);        
    },
    
    _onVolumePref: function(value) {
        value = Math.max(value/100, 0.05);
        if(this._prefs.volume === value) {return};
        this._prefs.volume = value;
        dojo.publish('/org/hark/prefs/request', ['volume']);        
    },
    
    _onSpeechVolumePref: function(value) {
        value = Math.max(value/100, 0.05);
        if(this._prefs.speechVolume === value) {return};
        this._prefs.speechVolume = value;
        dojo.publish('/org/hark/prefs/request', ['speechVolume']);                
    },
    
    _onSoundVolumePref: function(value) {
        value = Math.max(value/100, 0.05);
        if(this._prefs.soundVolume === value) {return};
        this._prefs.soundVolume = value;
        dojo.publish('/org/hark/prefs/request', ['soundVolume']);
    },
    
    _onMusicVolumePref: function(value) {
        value = Math.max(value/100, 0.05);
        if(this._prefs.musicVolume === value) {return};
        this._prefs.musicVolume = value;
        dojo.publish('/org/hark/prefs/request', ['musicVolume']);        
    }
});