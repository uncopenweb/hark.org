/**
 * Bar with login/logout, preferences, and help actions.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.SiteActions');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.TooltipDialog');
dojo.require('dijit.form.DropDownButton');
dojo.require('org.hark.widgets.PreferencesView')
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'SiteActions');

dojo.declare('org.hark.widgets.SiteActions', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark.widgets', 'templates/SiteActions.html'),
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark.widgets', 'SiteActions');
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
        dojo.style(this.profileNode.domNode, 'display', '');
        this.profileNode.attr('label', user.name);
        this.nameNode.innerHTML = user.name;
        this.emailNode.innerHTML = user.email;
        this.roleNode.innerHTML = dojo.replace(this.labels.role_label, 
            [user.role]);
        dojo.publish('/uow/auth', [user]);
    },
    
    _onNoAuth: function() {
        dojo.style(this.loginNode, 'display', '');
        dojo.publish('/uow/auth', [null]);
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
        uow.logout();
    }
});