/*
 *  BusyOverlay.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('org.hark.BusyOverlay');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('org.hark.BusyOverlay', [dijit._Widget,
                                      dijit._Templated], {
    // node to overlay
    busyNode: null,
    // parent node for the overlay, null for body w/ absolute coords
    parentNode: null,
    // message to display
    message: '',
    // show animation or not
    animate: true,
    // take focus while visible?
    takeFocus: true,
    // delay showing and taking focus for this many ms
    delayShow: 250,
    templatePath: dojo.moduleUrl('org.hark', 'templates/BusyOverlay.html'),
    postCreate: function() {
        this._delayToken = null;
        this._computeZIndex();
        this.connect(window, 'onresize', '_onResize');
        this._onResize();
    },
    
    startup: function() {
        if(this.delayShow) {
            this._delayToken = setTimeout(dojo.hitch(this, '_show'), 
                this.delayShow);
        } else {
            this._show();
        }
    },

    uninitialize: function() {
        clearTimeout(this._delayToken);
    },

    _setMessageAttr: function(text) {
        if(!this.messageNode) {return;}
        this.message = text;
        this.messageNode.innerHTML = text;
    },

    _setAnimateAttr: function(show) {
        if(!this.animationNode) {return;}
        this.animate = show;
        var t = show ? '' : 'none';
        dojo.style(this.animationNode, {display : t});
    },
    
    _show: function() {
        if(this.parentNode) {
            this.placeAt(this.parentNode);
        } else {
            this.placeAt(dojo.body());
        }
        if(this.takeFocus) {
            try {
                this.domNode.focus();
            } catch(e) {}
        }        
    },

    _onResize: function() {
        var c = dojo.marginBox(this.busyNode);
        var args = {
            position: 'absolute',
            width: c.w+'px',
            height: c.h+'px'
        };
        if(this.parentNode) {
            dojo.marginBox(this.domNode, {l : c.l, t : c.t});
        } else {
            dojo.marginBox(this.domNode, {l : c.x , t : c.y});
        }
        dojo.style(this.domNode, args);
    },
    
    _computeZIndex: function() {
        var z = 'auto';
        var node = this.busyNode;
        if(this.busyNode.currentStyle) {
            do {
                z = parseFloat(node.currentStyle['zIndex']);
                z = (isNaN(z)) ? 'auto' : z;
                node = node.parentNode;
            } while(z == 'auto' && node && node.currentStyle);
        } else {
            do {
                try {
                    var s = document.defaultView.getComputedStyle(node, null);
                    z = parseFloat(s.getPropertyValue('z-index'));
                } catch (e) {
                    z = NaN;
                }
                z = (isNaN(z)) ? 'auto' : z;
                node = node.parentNode;
            } while(z == 'auto' && node);
        }
        this.domNode.style.zIndex = z;
    }
});

org.hark.BusyOverlay.show = function(args) {
    var scope = org.hark.BusyOverlay;
    var inst = new scope(args);
    inst.startup();
    return inst;
};

org.hark.BusyOverlay.hide = function(inst) {
    inst.destroyRecursive();
};