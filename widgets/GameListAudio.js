/**
 * Game list speech and sound.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameListAudio');
dojo.require('dijit._Widget');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'GameListAudio');

dojo.declare('org.hark.widgets.GameListAudio', [dijit._Widget], {
    // game list model
    model : '',
    postMixInProperties: function() {
        this._labels = dojo.i18n.getLocalization('org.hark.widgets','GameListAudio');
        this.model = dijit.byId(this.model);
        // audio interface
        this._audio = null;
        uow.getAudio().then(dojo.hitch(this, function(a) {
            this._audio = a;
        }), function() {
            // @todo
        });
        // last tag regard and number of times regarded
        this._lastRegard = {
            count : 0,
            id : null
        };
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/org/hark/ctrl/regard-tag', this, '_onRegardTag');
        dojo.subscribe('/org/hark/ctrl/regard-game', this, '_onRegardGame');
    },
        
    _onRegardTag: function(ctrl, tag, index, total) {
        console.log(this._audio);
        var text = dojo.replace(this._labels.tag_speech, [tag]);
        this._audio.stop();
        this._audio.say({text : text});
        // @todo: decide what to announce
        this._lastRegard.id = tag;
        this._lastRegard.count++;
    },
    
    _onRegardGame: function(ctrl, item, index, fetched) {
        var text = item.label[this._locale];
        this._audio.stop();
        this._audio.say({text : text});
        // @todo: decide what to announce
        this._lastRegard.id = tag;
        this._lastRegard.count++;
    }
});