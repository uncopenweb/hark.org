/**
 * Game search results.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameListView');
dojo.require('org.hark.widgets.GameDialog');
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
        this._needsClear = false;
        this._busyOverlay = null;
    },

    postCreate: function(args) {
        // controller published events
        dojo.subscribe('/org/hark/lang', this, function(locale) {
            this._locale = locale;
        });
        dojo.subscribe('/org/hark/model/reset', this, '_onResetGames');
        dojo.subscribe('/org/hark/model/fetch', this, '_onFetchGames');
        dojo.subscribe('/org/hark/model/begin', this, '_onBeginGames');
        dojo.subscribe('/org/hark/model/item', this, '_onGamesItem');
        dojo.subscribe('/org/hark/model/done', this, '_onCompleteGames');
        dojo.subscribe('/org/hark/model/error', this, '_onGamesError');
        dojo.subscribe('/org/hark/ctrl/regard-tag', this, '_onRegardTag');
        dojo.subscribe('/org/hark/ctrl/regard-game', this, '_onRegardGame');
    },
    
    _showStatus: function(state) {
        // hide all status
        var nodes = dojo.query('div', this._statusNode).style({display : 'none'});
        // update the more link label
        if(state == 'more') {
            var count = Math.min(this.model.available-this.model.fetched, 
                this.model.perPage);
            var label = (count === 1) ? this._labels.more_results_label_s :
                this._labels.more_results_label;
            label = dojo.replace(label, [count, this.model.query]);
            this._moreNode.innerHTML = label;
        }
        // show status for state
        dojo.query('div.'+state, this._statusNode).style({display : ''});
    },
    
    _hideOverlay: function(bo) {
        bo = bo || this._busyOverlay;
        if(bo) {
            uow.ui.hideBusy({overlay : bo});
            this._busyOverlay = null;
        }
    },
    
    _doClear: function() {
        // clear the existing rows
        this._hideOverlay();
        dojo.empty(this._resultsNode);
        this._needsClear = false;
    },
    
    _onResetGames: function() {
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
                    this._hideOverlay(bo);
                }
            }));
        }
    },

    _onFetchGames: function(model) {
        if(!this._busyOverlay) {
            this._showStatus('loading');
        }
    },
    
    _onBeginGames: function(model) {
        // update summary row if this is a new fetch
        if(this._needsClear) {
            var label = (model.available === 1) ? this._labels.summary_label_s :
                this._labels.summary_label;
            label = dojo.replace(label, [model.available, model.query])
            this._summaryNode.innerHTML = label;
        }
    },

    _onGamesItem: function(model, db, item) {
        // clear the existing rows
        if(this._needsClear) {
            this._doClear();
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
            var div = dojo.create('div', {
                innerHTML : html,
                className : 'harkGameListViewItem'
            }, this._resultsNode);
            var nodes = dojo.query('a', div);
            if(item.url) {
                dojo.connect(nodes[0], 'onclick', function() {
                    dojo.publish('/org/hark/ctrl/select-game', [this, item]);
                });
            }
            if(item.attribution) {
                dojo.connect(nodes[1], 'onclick', function() {
                    org.hark.widgets.GameDialog.showCredits(item.attribution);
                });
            } else {
                nodes.style('display', 'none');
            }
        }
    },
    
    _onCompleteGames: function() {
        if(this._needsClear) {
            this._doClear();
        }
        if(this._busyOverlay) {
            this._hideOverlay();
        }
        if(this.model.available === 0) {
            this._showStatus('none');
        } else if(this.model.fetched < this.model.available) {
            this._showStatus('more');
        } else {
            this._showStatus('done');
        }
    },

    _onGamesError: function() {
        console.error('game fetch failed');
        if(this._busyOverlay) {
            // @todo: show message on overlay instead?
            this._doClear();
            this._showStatus('none');
        } else {
            // go back to current page
            this._page -= 1;
            // show more link again
            this._showStatus('more');
            // @todo: report error too
        }
    },
    
    _onClickNext: function(event) {
        this.model.fetchMore();
        dojo.stopEvent(event);
    },
    
    _onRegardGame: function(ctrl, item, index) {
        var nodes = dojo.query('.harkGameListViewItem', this._resultsNode);
        nodes.removeClass('selected');        
        var sel = nodes[index];
        dojo.addClass(sel, 'selected');
        sel.scrollIntoView(false);
    },
    
    _onRegardTag: function(ctrl) {
        dojo.query('.harkGameListViewItem', this._resultsNode)
        .removeClass('selected');                
    }
});