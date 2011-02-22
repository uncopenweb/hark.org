/**
 * Bar with login/logout, preferences, and help actions.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.SiteActions');
dojo.require('uow.ui.LoginButton');

dojo.declare('org.hark.widgets.SiteActions', [uow.ui.LoginButton], {
    displayField: 'name',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.widgets', 'templates/SiteActions.html'),
    postMixInProperties: function() {
        this.inherited(arguments);
        this.labels.welcome_user_label = '{0}';
    }
});