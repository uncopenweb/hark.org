/**
 * Game credits dialog.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameCredits');
dojo.require('dijit.Dialog');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'GameCredits');

dojo.ready(function() {
org.hark.widgets.GameCredits = (function() {
    var labels = dojo.i18n.getLocalization('org.hark.widgets', 'GameCredits');
    var args = {
        baseClass: 'harkGameCredits',
        title : labels.dialog_title
    };
    var template = labels.item_template;
    var dlg = new dijit.Dialog(args);
    dojo.connect(dlg, 'hide', function() {
        dojo.style(dojo.body(), 'overflow', '');
        org.hark.connectKeys();
    });

    var onLoad = function(arr) {
        var sections = {};
        var content = dojo.create('div');
        var spans = dojo.forEach(arr, function(item) {
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

    return function(url) {
        dojo.style(dojo.body(), 'overflow', 'hidden');
        org.hark.disconnectKeys();
        dlg.show();
        dojo.xhrGet({
            url : ROOT_PATH+url,
            handleAs: 'json',
            load: onLoad,
            error: function(err) {

            }
        });
    };
})();
});