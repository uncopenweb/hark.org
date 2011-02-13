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
        dojo.subscribe('/org/hark/ctrl/select-tag', this, '_onSelectItem');
        dojo.subscribe('/org/hark/ctrl/select-game', this, '_onSelectItem');
        dojo.subscribe('/org/hark/ctrl/unselect-game', this, '_onUnselectItem');
        dojo.subscribe('/org/hark/ctrl/regard-game/first', this, '_onRegardFirstGame');
        dojo.subscribe('/org/hark/ctrl/regard-game/last', this, '_onRegardLastGame');
        dojo.subscribe('/org/hark/ctrl/regard-game/busy', this, '_onRegardBusyGame');
        dojo.subscribe('/org/hark/ctrl/regard-tag/first', this, '_onRegardWrapTag');
        dojo.subscribe('/org/hark/ctrl/regard-tag/last', this, '_onRegardWrapTag');
    },
    
    _updateRegard: function(id) {
        if(id === this._lastRegard.id) {
            ++this._lastRegard.count;
        } else {
            this._lastRegard = {
                count : 0,
                id : id
            };
        }
        return this._lastRegard;
    },
        
    _onRegardTag: function(ctrl, tag, index, total) {
        var text;
        switch(this._updateRegard(tag).count % 3) {
            // announce tag
            case 0:
                text = dojo.replace(this._labels.tag_speech, [tag]);
                break;
            // report result count
            case 1:
                if(this.model.available === 1) {
                    text = dojo.replace(this._labels.tag_description_speech_s, 
                        [this.model.available, tag]);
                } else if(this.model.available > 0) {
                    text = dojo.replace(this._labels.tag_description_speech, 
                        [this.model.available, tag]);
                } else {
                    return;
                }
                break;
            // report help
            case 2:
                text = dojo.replace(this._labels.tag_help_speech, [tag]);
                break;
        }
        this._audio.stop();
        this._audio.say({text : text});
    },
    
    _onRegardGame: function(ctrl, item, index, fetched) {
        var text;
        switch(this._updateRegard(item).count % 3) {
            // report game name
            case 0:
                text = item.label[this._locale];
                break;
            // read game description
            case 1:
                text = item.description[this._locale];
                break;
            // report help
            case 2:
                text = item.label[this._locale];
                text = dojo.replace(this._labels.game_help_speech, [text]);
                break;
        }
        this._audio.stop();
        this._audio.say({text : text});
    },
    
    _onSelectItem: function() {
        this._audio.stop({channel : 'sound'});
        this._audio.play({
            channel : 'sound', 
            url : this._labels.select_item_sound
        });
    },
    
    _onUnselectItem: function() {
        this._audio.stop({channel : 'sound'});
        this._audio.play({
            channel : 'sound', 
            url : this._labels.unselect_item_sound
        });        
    },
    
    _onRegardWrapTag: function() {
        this._audio.stop({channel : 'sound'});
        this._audio.play({
            channel : 'sound', 
            url : this._labels.wrap_list_sound
        });        
    },

    _onRegardBusyGame: function() {
        this._audio.stop();
        this._audio.say({text : this._labels.busy_list_speech});
    },
    
    _onRegardFirstGame: function() {
        this._audio.stop({channel : 'sound'});
        this._audio.play({
            channel : 'sound', 
            url : this._labels.first_item_sound
        });
    },
    
    _onRegardLastGame: function() {
        this._audio.stop({channel : 'sound'});
        this._audio.play({
            channel : 'sound', 
            url : this._labels.last_item_sound
        });     
    }
});