/**
 * Bar with login/logout, preferences, and help actions.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.SiteActions');
dojo.require('org.hark.widgets.GameDialog');
dojo.require('dojo.hash');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.TooltipDialog');
dojo.require('dijit.form.DropDownButton');
dojo.require('org.hark.widgets.PreferencesView')
dojo.require('org.hark.widgets.PreferencesAudio');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'SiteActions');

dojo.declare('org.hark.widgets.SiteActions', [dijit._Widget, dijit._Templated], {
    // widget in template
    widgetsInTemplate: true,
    // site actions bar template
    templatePath: dojo.moduleUrl('org.hark.widgets', 'templates/SiteActions.html'),
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('org.hark.widgets', 'SiteActions');
        // game in progress
        this._game = null;
    },
    
    postCreate: function() {
        // controller published events
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/org/hark/ctrl/select-game', this, '_onSelectGame');
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
    
    _onClickLogin: function(event) {
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
    },
    
    _onClickHelp: function(event) {
        var page;
        if(this._game) {
            // show generic play help
            pages = ['playing.html', 'home.html'];
        } else if(!this.helpPage) {
            // show site help only
            pages = ['home.html'];
        } else {
            // show this page's help plus site help
            pages = [this.helpPage, 'home.html'];
        }
        for(var i=0, l=pages.length; i<l; i++) {
            var path = 'nls/'+this._locale+'/'+pages[i];
            pages[i] = dojo.moduleUrl('org.hark.pages', path).toString();
        }
        if(this._game && this._game.help) {
            // show game specific help
            pages.unshift(org.hark.rootPath + this._game.help);
        }
        org.hark.widgets.GameDialog.showHelp(pages);
    },
    
    _onSelectGame: function(ctrl, item) {
        this._game = item;
    }
});