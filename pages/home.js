/**
 * Home page controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require('dojo.i18n');
dojo.require('org.hark.pages.common');
dojo.require('org.hark.widgets.SiteTabs');
dojo.require('org.hark.widgets.SiteActions');
dojo.requireLocalization('org.hark', 'pages');

dojo.ready(function() {
    // make sure this browser is viable
    uow.ui.checkBrowser();

    // do our own label interpolation for the page
    var labels = org.hark.localizePage();
    
    // publish the db and help localization to use
    org.hark.publishLang('home');

    // update login ui
    dijit.byId('site_actions').triggerLogin();
});