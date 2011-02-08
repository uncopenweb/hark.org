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
    var template = '<p><a href="{url}">{name}</a> Copyright &copy; {year} {creator} under the {license}</p>';
    var dlg = new dijit.Dialog(args);

    var onLoad = function(arr) {
        var content = dojo.create('div');
        var spans = dojo.map(arr, function(item) {
            return dojo.replace(template, item);            
        });
        content.innerHTML = spans.join('');
        dlg.attr('content', content);
    };

    return function(url) {
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