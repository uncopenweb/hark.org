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
        var user = uow.getUser();
        if(user.email) {
            this._onAuth({flag : 'ok', user: user});
        } else {
            dojo.style(this.loginNode, 'display', '');
        }
    },
    
    _onAuth: function(response) {
        if(response.flag == 'ok') {
            dojo.style(this.loginNode, 'display', 'none');
            var welcome = dojo.replace(this.labels.welcome_label, response.user);
            this.welcomeNode.innerHTML = welcome;
            dojo.style(this.authedNode, 'display', '');
        }
    },
    
    _onClickLogin: function() {
        var def = uow.triggerLogin();
        def.addCallback(this, '_onAuth');
    },
    
    _onClickLogout: function() {
        dojo.cookie('user', null, {path : '/', expires: -1});
        window.location.reload();
    }
});