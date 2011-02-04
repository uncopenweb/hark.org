/**
 * Game list keyboard controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameListKeys');
dojo.require('dijit._Widget');

dojo.declare('org.hark.widgets.GameListKeys', [dijit._Widget], {
    // game list model
    model : null,
    postMixInProperties: function() {
        // timer to put focus back on body to re-enable keys
        // @todo
        this._focusTimer = null;
        // list of tags for the locale
        this._tags = null;
        // current tag
        this._tagIndex = 0;
        // current game
        this._gameIndex = 0;
        // browsing mode, tags or games
        this._mode = 'tags';
        this.model = dijit.byNode(this.model);
    },
    
    postCreate: function() {
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/uow/key/down', this, '_onKeyUp');
        dojo.subscribe('/org/hark/db/tags', this, '_onTagsDb');
    },
    
    _onTagsDb: function(db) {
        var req = db.fetch({
            query : {lang : this._locale},
            onComplete: function(items) {
                this._tags = dojo.map(items, 'return item.name');
                // start listening for global keys
                try {
                    uow.ui.connectKeys();
                } catch(e) { }
            },
            onError: function(err) {
                console.log('tags err');
            },
            scope: this
        });
    },
    
    _onKeyUp: function(event) {
        if(this._mode == 'tags') {
            this._onNavTags();
        } else {
            this._onNavGames();
        }
    },
    
    _onNavTags: function() {
        switch(event.keyCode) {
            case dojo.keys.UP_ARROW:
                // @todo: browse games for this tag, make sure fetched
                this._mode = 'games';
                break;
            case dojo.keys.DOWN_ARROW:
                this._regardTag();
                dojo.stopEvent(event);
                break;
            case dojo.keys.LEFT_ARROW:
                this._tagIndex -= 1;
                if(this._tagIndex < 0) {
                    this._tagIndex = this._tags.length - 1;
                }
                this._regardTag();
                dojo.stopEvent(event);
                break;
            case dojo.keys.RIGHT_ARROW:
                this._tagIndex = (this._tagIndex + 1) % this._tags.length;
                this._regardTag();
                dojo.stopEvent(event);
                break;
        }
    },
    
    _onNavGames: function() {
        switch(event.keyCode) {
            case dojo.keys.ESCAPE:
                this._mode = 'tags';
                this._regardTag();
                dojo.stopEvent(event);
                break;
            case dojo.keys.UP_ARROW:
            case dojo.keys.DOWN_ARROW:
            case dojo.keys.LEFT_ARROW:
            case dojo.keys.RIGHT_ARROW:
                dojo.stopEvent(event);
        }     
    },
    
    _regardTag: function() {
        var tag = this._tags[this._tagIndex];
        dojo.publish('/org/hark/ctrl/regard-tag', 
            [this, tag, this._tagIndex, this._tags.length]);        
    }
});