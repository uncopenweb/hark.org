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

    triggerLogin: function() {
        var def = uow.getUser();
        def.addCallback(this, function(user) {
            if(user.email) {
                this._onAuth(user);
            } else {
                throw new Error('not authed')
            }            
        }).addErrback(this, '_onNoAuth');
    },
    
    _onAuth: function(user) {
        dojo.style(this.loginNode, 'display', 'none');
        var welcome = dojo.replace(this.labels.welcome_user_label, user);
        this.welcomeNode.innerHTML = welcome;
        dojo.style(this.authedNode, 'display', '');
        dojo.publish('/hark/auth', [user]);
    },
    
    _onNoAuth: function() {
        dojo.style(this.loginNode, 'display', '');
        dojo.publish('/hark/auth', [null]);
    },
    
    _onClickLogin: function() {
        var def = uow.triggerLogin();
        def.addCallback(this, function(response) {
            if(response.flag == 'ok') {
                this._onAuth(response.user);
            } else {
                throw new Error('not authed')
            }
        }).addErrback(this, '_onNoAuth');
    },
    
    _onClickLogout: function() {
        dojo.cookie('user', null, {path : '/', expires: -1});
        window.location.reload();
    }
});