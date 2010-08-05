/*
 *  GameFrame.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.GameFrame');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark', 'GameFrame');

dojo.declare('org.hark.GameFrame', [dijit._Widget, dijit._Templated], {
    // game url
    url: '',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('org.hark', 'templates/GameFrame.html'),

    postMixInProperties: function() {
        // token for key handler
        this._keyTok = null;
        this.labels = dojo.i18n.getLocalization('org.hark','GameFrame');
    },

    postCreate: function() {

    },
    
    _setUrlAttr: function(url) {
        this.url = url;
        var display, src;
        if(this.url) {
            display = '';
            src = this.url;
        } else {
            display = 'none';
            src = 'about:blank';
        }
        dojo.style(this.domNode, 'display', display);
        this.frameNode.src = src;
        
        // force a resize
        this.borderContainer.resize();
    },
    
    _onFrameLoad: function(event) {
        if(this._keyTok) {
            dojo.disconnect(this._keyTok);
            this._keyTok = null;
        }
        this._keyTok = dojo.connect(event.target.contentWindow, 'onkeyup', this, 
            '_onKeyPress');
    },
    
    _onKeyPress: function(event) {
        console.log(event);
    }
});