/**
 * Common page functions and attributes.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
/*global dojo org uow window dijit*/
dojo.provide('org.hark.pages.common');
dojo.require('org.hark.widgets.SiteTabs');
dojo.require('org.hark.widgets.SiteActions');
dojo.require('org.hark.widgets.SiteKeys');
dojo.require('org.hark.widgets.SiteAudio');
dojo.require('org.hark.widgets.GameDialog');

// root path for all urls
org.hark.rootPath = '../';
// known supported translations
org.hark.langs = [];
// modifier for site wide hotkeys
org.hark.modifier = 'shiftKey';

org.hark.connectKeys = function() {
    // start listening for global keys
    dojo.body().focus();
    try {
        uow.ui.connectKeys();
    } catch(e) { }
};

org.hark.disconnectKeys = function() {
    // disable global key catch
    try {
        uow.ui.disconnectKeys();
    } catch(e) { }
};

org.hark.localizePage = function(name) {
    var labels;
    try {
        labels = dojo.i18n.getLocalization('org.hark.pages', name);
    } catch(e) { }
    if(labels) {
        dojo.query('[data-label]').forEach(function(node) {
            var name = node.getAttribute('data-label');
            var text = labels[name];
            if(text) {
                node.innerHTML = labels[name];
            }
        });
    }
    return labels;
};

org.hark.publishLang = function() {
    // determine language to use
    var lang = 'en-us';
    if(dojo.indexOf(dojo.locale, org.hark.langs) !== -1) {
        // use translation
        lang = dojo.locale;
    }
    dojo.publish('/org/hark/lang', [lang]);
    return lang;
};

org.hark.monitorIdle = function() {
    var move = 0,
        scroll = 0,
        key = 0,
        idleCount = 0;
        
    var evaluate = function() {
        var wait = 30000;
        if(move || scroll || key) {
            // saw activity, reset idle count
            idleCount = 0;
        } else {
            // no activity, publish idle
            dojo.publish('/org/hark/idle', [move, scroll, key]);
            // backoff on idle notices
            wait = Math.max(10000+(5000*idleCount++), wait);
        }
        setTimeout(evaluate, wait);
        move = scroll = key = 0;
    };

    // wait a bit to avoid transient mouse moves    
    setTimeout(function() {
        dojo.connect(window, 'mousemove', function() {
            move++;
        });
        dojo.connect(window, 'onscroll', function() {
            scroll++;
        });
        setTimeout(evaluate, 3000);
    }, 2000);

    // watch keys immediately
    dojo.subscribe('/uow/key/down', function(event) {
        // cheat a bit, we know what keys are meaningful
        switch(event.keyCode) {
            case dojo.keys.UP_ARROW:
            case dojo.keys.LEFT_ARROW:
            case dojo.keys.RIGHT_ARROW:
            case dojo.keys.DOWN_ARROW:
            case dojo.keys.SHIFT:
                key++;
        }
    });
};

org.hark.init = function(name) {
    // make sure this browser is viable
    var def = uow.ui.checkBrowser();
    def.then(function(ok) {
        if(ok) {
            // parse if OK
            dojo.parser.parse();  
            // do our own label interpolation for the page
            var labels = org.hark.localizePage(name);
            // publish the db and help localization to use
            var locale = org.hark.publishLang(name);
            // trigger login method
            var actions = dijit.byId('site_actions');
            if(actions) {
                actions.triggerLogin();
            }
            // connect global key handler
            org.hark.connectKeys();
            // publish that keys are connected
            dojo.publish('/org/hark/ctrl/keys-ready', [null, true]);
            // monitor the page for idle time and prompt if needed
            org.hark.monitorIdle();
            // listen for game credits click
            dojo.query('#bottom a').onclick(function(event) {
                dojo.stopEvent(event);
                org.hark.widgets.GameDialog.showCredits('info/attribution.json', true);
            });
        }
    });
};