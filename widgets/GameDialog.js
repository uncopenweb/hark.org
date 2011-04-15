/**
 * Game credits dialog.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameDialog');
dojo.require('dijit.Dialog');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'GameDialog');

dojo.ready(function() {
org.hark.widgets.GameDialog = (function() {
    var labels = dojo.i18n.getLocalization('org.hark.widgets', 'GameDialog');
    var args = {
        baseClass: 'harkGameDialog'
    };
    var dlg = new dijit.Dialog(args);
    dojo.connect(dlg, 'hide', function() {
        dojo.style(dojo.body(), 'overflow', '');
        if(org.hark.connectKeys) {
            org.hark.connectKeys();
        }
    });

    var onLoad = function(arr) {
        var sections = {};
        var content = dojo.create('div');
        var template;
        var spans = dojo.forEach(arr, function(item) {
            if(item.license.toLowerCase() === 'public domain') {
                template = labels.public_item_template;
            } else {
                template = labels.copyright_item_template;
            }
            var p = dojo.replace(template, item);
            var t = sections[item.type];
            if(!t) {
                t = sections[item.type] = [];
            }
            t.push(p);
        });
        for(var key in sections) {
            var header = '<h3>'+labels.headings[key]+'</h3>';
            var text = sections[key].join('');
            content.innerHTML += header + text;
        }
        dlg.attr('content', content);
    };

    return {
        _show: function(title) {
            dojo.style(dojo.body(), 'overflow', 'hidden');
            if(org.hark.disconnectKeys) {      
                org.hark.disconnectKeys();
            }
            dlg.attr('title', title);
            dlg.show();            
        },
        
        showCredits : function(url, siteNotGame) {
            this._show(labels.credits_title);
            dojo.xhrGet({
                url : siteNotGame ? url : org.hark.rootPath+url,
                handleAs: 'json',
                load: onLoad,
                error: function(err) {
                    // @todo: handle error loading attribution
                }
            });
        },

        showHelp: function(urls) {
            this._show(labels.help_title);
            var html = '';
            for(var i=0, l=urls.length; i<l; i++) {
                html += dojo.cache(new dojo._Url(urls[i]));
            }
            dlg.attr('content', html);
        }
    };
})();
});