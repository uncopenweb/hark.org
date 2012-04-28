/**
 * Renders a user's list of games.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameExplorer');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.require('org.hark.widgets.GameEditor');
dojo.require('dijit.Dialog');
dojo.require('dijit.form.ToggleButton');
dojo.requireLocalization('org.hark.widgets', 'GameListView');

dojo.declare('org.hark.widgets.GameExplorer', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    // widget template
    templateString : dojo.cache('org.hark.widgets.templates', 'GameExplorer.html'),
    // result row template
    resultTemplate : dojo.cache('org.hark.widgets.templates', 'GameExplorerListItem.html'),
    // i18n labels
    _labels: dojo.i18n.getLocalization('org.hark.widgets','GameListView'),
    //curr authed user
    user: '',
    //does the curr user own games?
    items:false,
    
    postCreate: function(){
        //build a hidden delete confirmation dialog
        this._buildConfirmDialog();
        //grab games for curr user
        this.populateGames();
    },
    
    // populates game list with curr user's games
    populateGames: function(){
        uow.data.getDatabase({
            database: 'harkhome',
            collection : 'games',
            mode : 'r'
        }).then(dojo.hitch(this, function(db) {
            db.fetch({
                query : {_owner :  "duncan.lewis11@gmail.com"},
                onItem: dojo.hitch(this,function(item) {
                    this.createEntry(db, item);
                    this.items = true;
                }),
                onComplete: dojo.hitch(this,function(){
                    if(!this.items)
                        dojo.style(this.noGames,"display","block");
                })
            });
        }),function(){
            console.error("Game retrieval from harkhome failed for user "+this.user);
        });
    },
    
    //Creates game entry
    createEntry: function(db, item){
        var tmpl = this.resultTemplate;
        var url = db.getValue(item, 'url');
        var label = db.getValue(item, 'label');
        label = label[this._locale] || label['en-us'];
        var desc = db.getValue(item, 'description');
        desc = desc[this._locale] || desc['en-us'];
        var tags = db.getValue(item, 'tags');
        tags = tags[this._locale] || tags['en-us'];
        var html = dojo.replace(tmpl, {
            _labels : this._labels,
            game_label : label,
            game_description : desc,
            game_tags : tags,
            icon_src : org.hark.rootPath + db.getValue(item, 'media').icon,
            icon_alt : label
        });
        var div = dojo.create('div', {
            innerHTML : html,
            className : 'harkGameListViewItem'
        }, this.gamesList);
        var nodes = dojo.query('button', div);
        var delFn = dojo.hitch(this,function(e){ this.deleteGame(e, item.dataId, item.kind); });
        var editFn = dojo.hitch(this,function(){ this.editGame(item.dataId, item.kind); });
        dojo.connect(nodes[0],'onclick',this,delFn);
        if(!item.kind || item.kind.length<1){
            dojo.attr(nodes[1], "disabled", "disabled");
            dojo.removeAttr(nodes[1], "active");
        }else
            dojo.connect(nodes[1],'onclick',this,editFn);
    },
    
    //Shows delete confirm dialog
    deleteGame: function(e, id, kind){
        var one = dojo.connect(dijit.byId('yesButton'),'onClick',this, function(){
            this.reallyDeleteGame(e, id, kind);
        });
        var two = dojo.connect(dijit.byId('noButton'),'onClick',this, function(){
            dijit.byId('tDialog').hide();
            this._label = null;
        });
        var three = dojo.connect(dijit.byId('tDialog'), 'onHide', this, function(){
            dojo.disconnect(one);
            dojo.disconnect(two);
            dojo.disconnect(three);
        });
        dijit.byId('tDialog').set('content', "You won't be able to recover this game if you delete it.");
        dijit.byId('tDialog').show();
    },
    
    //Serves up form.html & builds a FormGenerator
    editGame: function(id, kind){
        var segs = window.location.pathname.split('/');
        segs[segs.length-1] = "form.html";
        var n = segs.join('/')+"?dataID="+encodeURI(id)+"&kind="+kind;
        window.location = window.location.origin+n;
    },
    
    //Called if user selects "yes" from confirm delete dialog
    reallyDeleteGame: function(e, id, kind){
        //delete from harkhome & harkGames
        uow.data.getDatabase({
            database: 'harkhome',
            collection : 'games',
            mode : 'crud'
        }).then(dojo.hitch(this, function(db) {
            db.deleteOne({
               query: {dataId:id},
               save:true
            }).then(dojo.hitch(this,function(){
                uow.data.getDatabase({
                    database: 'harkGames',
                    collection : kind+"Games",
                    mode : 'crud'
                }).then(dojo.hitch(this, function(db) {
                    db.deleteOne({
                       query: {_id:id},
                       save:true
                    }).then(dojo.hitch(this,function(){
                        this.destroyEntry(e.target.parentNode.parentNode);
                    }));
                }),function(){
                    console.error("Game data retrieval from harkHome failed");
                });
            }));
        }),function(){
            console.error("Game data retrieval from harkhome failed");
        });
    },
    
    //Destroys entry node after delete
    destroyEntry: function(node){
        dojo.destroy(node);
        dijit.byId("tDialog").hide();
        if(this.gamesList.childNodes.length == 0)
            dojo.style(this.noGames,"display","block");
    },
    
    //Build delete confirm dialog
    _buildConfirmDialog: function(){
        secondDlg = new dijit.Dialog({
            title: "Are you sure?",
            style: "width: 300px;font:14px arial;background:white;",
            id: 'tDialog'
        });
        var h = dojo.create('div',{'style':'margin-left:auto;margin-right:auto;width:80px;margin-bottom:5px'},secondDlg.domNode,'last');
        var yes = new dijit.form.ToggleButton({
            label: '<span style="font-family:Arial;font-size:10px;">Yes</span>',
            showLabel: true,
            id: 'yesButton'
        });
        var no = new dijit.form.ToggleButton({
            label: '<span style="font-family:Arial;font-size:10px;">No</span>',
            showLabel: true,
            id: 'noButton'
        });
        dojo.place(yes.domNode, h, 'last');
        dojo.place(no.domNode, h, 'last');
        return secondDlg
    }
    
});