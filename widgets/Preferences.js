/**
 * Preferences.js
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.Preferences');

(function() {
    // defaults
    org.hark.Preferences = {
        mouseEnabled: true,
        speechEnabled: true,
        volume: 1.0,
        speechVolume: 1.0,
        soundVolume: 0.8,
        musicVolume: 0.3
    };

    // current prefs
    var json = localStorage['org.hark.Preferences'];
    if(json) {
        dojo.mixin(org.hark.Preferences, dojo.fromJson(json));
    }

    // save prefs on page unload
    dojo.addOnUnload(function() {
        localStorage['org.hark.Preferences'] = dojo.toJson(org.hark.Preferences);
    });
})();