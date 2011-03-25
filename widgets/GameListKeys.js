/**
 * Game list keyboard controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameListKeys');
dojo.require('dijit._Widget');

dojo.declare('org.hark.widgets.GameListKeys', [dijit._Widget], {
    // game list model
    model : '',
    postMixInProperties: function() {
        // @todo: timer to put focus back on body to re-enable keys
        this._focusTimer = null;
        // list of tags for the locale
        this._tags = null;
        // current tag
        this._tagIndex = -1;
        // current game
        this._gameIndex = 0;
        // browsing mode, tags or games
        this._mode = 'tags';
        this.model = dijit.byId(this.model);
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/uow/key/down', this, '_onKeyDown');
        dojo.subscribe('/org/hark/db/tags', this, '_onTagsDb');
    },
    
    _onTagsDb: function(db) {
        var req = db.fetch({
            query : {lang : this._locale},
            onComplete: function(items) {
                this._tags = dojo.map(items, 'return item.name');
                // hijack keys once tags are available
                org.hark.connectKeys();
                dojo.publish('/org/hark/ctrl/keys-ready', [true]);
            },
            onError: function(err) {
                console.log('tags err');
            },
            scope: this
        });
    },
    
    _onKeyDown: function(event) {
        if(this._mode == 'tags') {
            this._onNavTags(event);
        } else {
            this._onNavGames(event);
        }
    },
    
    _onNavTags: function(event) {
        switch(event.keyCode) {
            case dojo.keys.UP_ARROW:
                dojo.stopEvent(event);
                this._mode = 'games';
                this._gameIndex = 0;
                dojo.publish('/org/hark/ctrl/select-tag', [this]);
                this._regardGame();
                break;
            case dojo.keys.DOWN_ARROW:
                dojo.stopEvent(event);
                this._regardTag();
                break;
            case dojo.keys.LEFT_ARROW:
                dojo.stopEvent(event);
                this._tagIndex -= 1;
                if(this._tagIndex < 0) {
                    this._tagIndex = this._tags.length - 1;
                    dojo.publish('/org/hark/ctrl/regard-tag/last', [this]);
                }
                this._regardTag();
                break;
            case dojo.keys.RIGHT_ARROW:
                dojo.stopEvent(event);
                this._tagIndex += 1;
                if(this._tagIndex >= this._tags.length) {
                    this._tagIndex = 0;
                    dojo.publish('/org/hark/ctrl/regard-tag/first', [this]);
                }
                // this._tagIndex = (this._tagIndex + 1) % this._tags.length;
                this._regardTag();
                break;
        }
    },
    
    _onNavGames: function(event) {
        switch(event.keyCode) {
            case dojo.keys.ESCAPE:
                dojo.stopEvent(event);
                this._mode = 'tags';
                dojo.publish('/org/hark/ctrl/unselect-tag', [this]);
                this._regardTag();
                break;
            case dojo.keys.UP_ARROW:
                dojo.stopEvent(event);
                var item = this.model.getItem(this._gameIndex);
                dojo.publish('/org/hark/ctrl/select-game', [this, item]);
                break;
            case dojo.keys.DOWN_ARROW:
                dojo.stopEvent(event);
                this._regardGame();
                break;
            case dojo.keys.LEFT_ARROW:
                dojo.stopEvent(event);
                this._gameIndex -= 1;
                if(this._gameIndex < 0) {
                    // @todo: should wrap, but how to deal with paging?
                    this._gameIndex = 0;
                    dojo.publish('/org/hark/ctrl/regard-game/first', [this]);
                    break;
                }
                this._regardGame();
                break;
            case dojo.keys.RIGHT_ARROW:
                dojo.stopEvent(event);
                this._gameIndex += 1;
                if(this._gameIndex >= this.model.available) {
                    // @todo: should wrap, but how to deal with paging?
                    // end of list of available games
                    this._gameIndex -=1;
                    dojo.publish('/org/hark/ctrl/regard-game/last', [this]); 
                    break;
                } else if(this._gameIndex >= this.model.fetched-2 &&
                    this._gameIndex < this.model.fetched &&
                    this.model.fetched < this.model.available) {
                    // nearing end of list of fetched games, fetch more
                    // but allow nav
                    this.model.fetchMore();
                } else if(this._gameIndex >= this.model.fetched) {
                    // end of fetched and busy fetching
                    this._gameIndex -=1;
                    dojo.publish('/org/hark/ctrl/regard-game/busy', [this]); 
                    break;
                }
                this._regardGame();
                break;
        }     
    },
    
    _regardTag: function() {
        var tag = this._tags[this._tagIndex];
        try {
            dojo.publish('/org/hark/ctrl/regard-tag', 
                [this, tag, this._tagIndex, this._tags.length]);
        } catch(e) {
            console.error(e);
        }
    },

    _regardGame: function() {
        var item = this.model.getItem(this._gameIndex);
        try {
            dojo.publish('/org/hark/ctrl/regard-game', 
                [this, item, this._gameIndex, this.model.fetched, this.model.available]);
        } catch(e) {
            console.error(e);
        }
    }
});