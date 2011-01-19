/**
 * Main controller for the HTS site.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'pages');

dojo.ready(function() {
    try {
        var labels = dojo.i18n.getLocalization('org.hark', 'pages');
    } catch(e) {
        // no translation, stick with default
        return;
    }
    dojo.query('[data-label]').forEach(function(node) {
        var name = node.getAttribute('data-label');
        var text = labels[name];
        if(text) {
            node.innerHTML = labels[name];
        }
    });
});