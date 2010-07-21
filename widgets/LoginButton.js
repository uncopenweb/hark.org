/**
 * Login button widget.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('org.hark.LoginButton');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'LoginButton');

dojo.declare('org.hark.LoginButton', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark', 'templates/LoginButton.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark','LoginButton');
    },

    postCreate: function() {

    },

    startup: function() {

    },

    uninitialize: function() {

    },
    
    _onClickLogin: function() {
        
    },
    
    _onClickLogout: function() {
        
    }
});