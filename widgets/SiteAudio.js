/**
 * Site nav audio output.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
/*global dojo dijit uow*/
dojo.provide('org.hark.widgets.SiteAudio');
dojo.require('dijit._Widget');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'SiteAudio');

dojo.declare('org.hark.widgets.SiteAudio', [dijit._Widget], {
    // make idle prompt announcements?
    promptIdle: false,
    postMixInProperties: function() {
        this._labels = dojo.i18n.getLocalization('org.hark.widgets', 'SiteAudio');
        // track if keys ready
        this._keysReady = false;
        // last page regard and number of times regarded
        this._lastRegard = {
            count : 0,
            id : null
        };
        // audio interface
        this._audio = null;
        uow.getAudio().then(dojo.hitch(this, function(a) {
            this._audio = a;
            if(this._keysReady) {
                this._onKeysReady();
            }
        }), function() {
            // @todo: fail gracefully
        });
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/ctrl/keys-ready', this, '_onKeysReady');
        // dojo.subscribe('/org/hark/ctrl/select-page', this, '_onSelectPage');
        dojo.subscribe('/org/hark/ctrl/regard-page', this, '_onRegardPage');
        dojo.subscribe('/org/hark/ctrl/regard-page/first', this, '_onRegardWrapPage');
        dojo.subscribe('/org/hark/ctrl/regard-page/last', this, '_onRegardWrapPage');
        dojo.subscribe('/org/hark/ctrl/stop-audio', this, '_onStopAudio');
        dojo.subscribe('/org/hark/idle', this, '_onUserIdle');
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

    _onKeysReady: function() {
        this._keysReady = true;
        if(!this._audio) {return;}
        this._audio.stop({channel : 'sound'});
        this._audio.play({
            channel : 'sound', 
            url : this._labels.ready_sound
        });
    },
    
    _onRegardPage: function(ctrl, url, name) {
        if(!this._audio) {return;}
        var text;
        switch(this._updateRegard(url).count % 2) {
            // report game name
            case 0:
                text = dojo.replace(this._labels.page_speech, [name]);
                break;
            // report help
            case 1:
                text = dojo.replace(this._labels.page_help_speech, [name]);
                break;
        }
        this._audio.stop();
        this._audio.setProperty({name: 'voice', value: 'default'});
        this._audio.say({text : text});
    },
    
    _onRegardWrapPage: function() {
        this._audio.stop({channel : 'sound'});
        this._audio.play({
            channel : 'sound', 
            url : this._labels.wrap_list_sound
        });
    },
    
    _onUserIdle: function() {
        if(!this.promptIdle) {return;}
        var text = this._labels.idle_prompt_speech;
        this._audio.stop();
        this._audio.setProperty({name: 'voice', value: 'default'});
        this._audio.say({text : text});
    },
    
    _onStopAudio: function() {
        this._audio.stop();
        this._audio.stop({channel : 'sound'});
    }
});