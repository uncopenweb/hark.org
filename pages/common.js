/**
 * Common page functions and attributes.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.pages.common');
dojo.require('org.hark.widgets.SiteTabs');
dojo.require('org.hark.widgets.SiteActions');
dojo.require('org.hark.widgets.SiteKeys');

// root path for all urls
org.hark.rootPath = '../';
// known supported translations
org.hark.langs = [];
// track connect and disconnect counts
org.hark._keySem = 0;
// modifier for site wide hotkeys


org.hark.connectKeys = function() {
    org.hark._keySem -= 1;
    if(org.hark._keySem <= 0) {
        org.hark._keySem = 0;
        // start listening for global keys
        dojo.body().focus();
        try {
            uow.ui.connectKeys();
        } catch(e) { }
    }
};

org.hark.disconnectKeys = function() {
    org.hark._keySem += 1;
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
    var lang = 'en-us'
    if(dojo.indexOf(dojo.locale, org.hark.langs) !== -1) {
        // use translation
        lang = dojo.locale;
    }
    dojo.publish('/org/hark/lang', [lang]);
    return lang;
};