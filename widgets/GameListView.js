/**
 * Game search results.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameListView');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('org.hark.widgets', 'GameListView');

dojo.declare('org.hark.widgets.GameListView', [dijit._Widget, dijit._Templated], {
    // game list model
    model : '',
    // result row template
    resultTemplate : dojo.cache('org.hark.widgets.templates', 'GameListViewItem.html'),
    // widget template
    templateString : dojo.cache('org.hark.widgets.templates', 'GameListView.html'),
    postMixInProperties: function() {
        this.model = dijit.byId(this.model);
        this._labels = dojo.i18n.getLocalization('org.hark.widgets','GameListView');
        this._labels.more_results_label = dojo.replace(
            this._labels.more_results_label, [this.model.perPage]);
        this._needsClear = false;
        this._busyOverlay = null;
    },

    postCreate: function(args) {
        // controller published events
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/org/hark/model/reset', this, '_onGamesReset');
        dojo.subscribe('/org/hark/model/fetch', this, '_onGamesFetch');
        dojo.subscribe('/org/hark/model/item', this, '_onGamesItem');
        dojo.subscribe('/org/hark/model/done', this, '_onGamesComplete');
        dojo.subscribe('/org/hark/model/error', this, '_onGamesError');
    },
    
    _showStatus: function(state) {
        // hide all status
        dojo.query('div', this._statusNode).style({display : 'none'});
        // show status for state
        dojo.query('div.'+state, this._statusNode).style({display : ''});
    },
    
    _onGamesReset: function() {
        this._needsClear = true;
        if(!this._busyOverlay) {
            // show a busy over the existing content
            uow.ui.showBusy({
                busyNode: this._resultsNode,
                parentNode: this.domNode,
                takeFocus: false
            }).then(dojo.hitch(this, function(bo) {
                if(this._needsClear) {
                    this._busyOverlay = bo;
                } else {
                    // hide it right away
                    this._busyOverlay = null;
                    uow.ui.hideBusy({overlay : bo});
                }
            }));
        }
    },

    _onGamesFetch: function() {
        if(!this._busyOverlay) {
            this._showStatus('loading');
        }
    },

    _onGamesItem: function(model, db, item) {
        // clear the existing rows
        if(this._needsClear) {
            if(this._busyOverlay) {
                uow.ui.hideBusy({overlay : this._busyOverlay});
                this._busyOverlay = null;
            }
            dojo.empty(this._resultsNode);
            this._needsClear = false;
        }

        if(item) {
            var tmpl = this.resultTemplate;
            var url = db.getValue(item, 'url');
            var label = db.getValue(item, 'label');
            label = label[dojo.locale] || label['en-us'];
            var desc = db.getValue(item, 'description');
            desc = desc[dojo.locale] || desc['en-us'];
            var tags = db.getValue(item, 'tags');
            tags = tags[dojo.locale] || tags['en-us'];
            var html = dojo.replace(tmpl, {
                _labels : this._labels,
                game_href :  '#' + org.hark.urlToSlug(url),
                game_label : label,
                game_description : desc,
                game_tags : tags,
                icon_src : ROOT_PATH + db.getValue(item, 'media').icon,
                icon_alt : label
            });
            dojo.create('div', {
                innerHTML : html,
                className : 'harkGameListViewItem'
            }, this._resultsNode);
        }
    },
    
    _onGamesComplete: function() {
        if(this.model.available === 0) {
            this._showStatus('none');
        } else if(this.model.fetched < this.model.available) {
            this._showStatus('more');
        } else {
            this._showStatus('done');
        }
    },
    
    _onGamesError: function() {
        // @todo
    },
    
    _onClickNext: function(event) {
        this.model.fetchMore();
        dojo.stopEvent(event);
    }
});