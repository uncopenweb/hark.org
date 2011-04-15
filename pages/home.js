/**
 * Home page controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require('dojo.i18n');
dojo.require('org.hark.pages.common');
dojo.requireLocalization('org.hark', 'pages');

dojo.ready(function() {
    // do common setup
    org.hark.init('home');

    // listen for game selects and unselects
    dojo.subscribe('/org/hark/ctrl/select-page', function(ctrl, page) {
        // go to page
        window.location = page;
    });    
});