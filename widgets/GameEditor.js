/**
 * Game Editor (Form Generator with some sugar)
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.provide('org.hark.widgets.GameEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('unc.FormGenerator');
// dojo.require('dojo.i18n');
// dojo.requireLocalization('org.hark.widgets', 'GameListView');

dojo.declare('org.hark.widgets.GameEditor', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    // widget template
    templateString : dojo.cache('org.hark.widgets.templates', 'GameEditor.html'),
    // game data id
    gameDataId: null,
    // kind of game (e.g. naming)
    gameKind: null,
    // game data corresponding to schema
    gameData: null,
    // game schema
    gameSchema: null,
    // handle to FormGenerator
    gen: null,
    // Is this an EDIT or a CREATE?
    clean: false,
    // Are there errors in the form?
    valid: true,
    
    postCreate: function(){
        //If this is a NEW game, go straight to getting 
        //approriate schema. Otherwise, start from the type
        this.getGameSchema();
        //Build error dialog
        this._buildErrorDialog();
    },
    
    //Get the corresponding
    //schema from harkhome/gameSchemas
    getGameSchema: function(){
        uow.data.getDatabase({
            database: 'harkhome',
            collection : 'gameSchemas',
            mode : 'r'
        }).then(dojo.hitch(this, function(db) {
            db.fetch({
                query : {kind : this.gameKind},
                onItem: dojo.hitch(this,function(item) {
                    this.sanitize(item.jsonSchema);
                    this.gameSchema = item.jsonSchema;
                    if(!this.clean)
                        this.getGameData();
                    else
                        this.buildGen();
                })
            });
        }),function(){
            console.error("Game schema retrieval from harkhome failed");
        });
    },
    
    //Once we have the gameSchema, get the corresponding
    //game data from harkGames
    getGameData: function(){
        //Figure out what kind of game this is
        uow.data.getDatabase({
            database: 'harkGames',
            collection : this.gameKind+"Games",
            mode : 'r'
        }).then(dojo.hitch(this, function(db) {
            db.fetch({
                query:{_id:this.gameDataId},
                onItem: dojo.hitch(this,function(item) {
                    this.sanitize(item);
                    this.gameData = item;
                }),
                onComplete: dojo.hitch(this,"buildGen")
            });
        }),function(){
            console.error("Game data retrieval from harkGames failed");
        });
    },
    
    //Build the FormGenerator
    buildGen: function(){
        this.gen = new unc.FormGenerator({
            schema:this.gameSchema,
            initValue:this.gameData,
            jsID:"myform"
        });
        dojo.place(this.gen.domNode, this.editorSave, "before");
        //Connect to value aquisition / validation
        dojo.connect(this.editorSave, 'onclick', this, 'validate');
        dojo.publish("editor/Rendered",{});
        dojo.style(this.editorSave,'display','block');
    },
    
    //Saves game data into harkGames db
    saveGame: function(){
        var data = this.gen.get("value");
        var name = (data.Name.length==0) ? "Untitled" : data.Name;
        var desc = (data.Description.length==0) ? "No description provided." : data.Description;
        var rand = Math.floor(Math.random()*11);
        uow.data.getDatabase({
            database: 'harkGames',
            collection : this.gameKind+"Games",
            mode : 'crud'
        }).then(dojo.hitch(this, function(db) {
            db.putOne({
               query: {id:rand},
               data:data,
               save:true
            }).then(dojo.hitch(this,function(item){
                var url = this.getUrl(item._id);
                if(data.tags)
                    var tags = data.tags["en-us"].replace(/ /g,",");
                var value = {
                    "url" : url,
                    "label" : {"en-us" : name},
                    "tags" : {"en-us" : "classic"},
                    "description" : {"en-us" : desc},
                    "media" : {
                        "icon" : "ClassicHark/info/Question.png",
                        "screenshots" : []
                    },
                    "dataId": item._id,
                    "kind" : this.gameKind,
                    "attribution": ""
                };
                uow.data.getDatabase({
                    database: 'harkhome',
                    collection : 'games',
                    mode : 'crud'
                }).then(dojo.hitch(this,function(db){
                    db.putOne({
                       query: {id:url},
                       data:value,
                       save:true
                    }).then(dojo.hitch(this,"goToSplash"));
                }),function(){
                    console.error("Game data retrieval from harkhome failed 2");
                }); 
            }));
        }),function(){
            console.error("Game data retrieval from harkGames failed 2");
        });
    },
    
    // Delete previous entry before doing a 
    // regular save
    saveModifiedGame: function(){
        //delete from harkhome & harkGames
        uow.data.getDatabase({
            database: 'harkhome',
            collection : 'games',
            mode : 'crud'
        }).then(dojo.hitch(this, function(db) {
            db.deleteOne({
               query: {dataId:this.gameDataId},
               save:true
            }).then(dojo.hitch(this,function(){
                uow.data.getDatabase({
                    database: 'harkGames',
                    collection : this.gameKind+"Games",
                    mode : 'crud'
                }).then(dojo.hitch(this, function(db) {
                    db.deleteOne({
                       query: {_id:this.gameDataId},
                       save:true
                    }).then(dojo.hitch(this,"saveGame"));
                }),function(){
                    console.error("Game data retrieval from harkGames failed 1");
                });
            }));
        }),function(){
            console.error("Game data retrieval from harkhome failed 1");
        });
    },
    
    //Convert a title to a proper URL for ClassicHark
    getUrl: function(id){
        return "ClassicHark/HarkTheSound/#"+this.gameKind+"-"+id;
    },
    
    //Go back to editorSplash page
    goToSplash: function(label){
        var segs = window.location.pathname.split('/');
        segs[segs.length-1] = "editor.html";
        var n = segs.join('/');
        window.location = window.location.origin+n;
    },
    
    //Clean the json returned by the DB
    sanitize: function(json) {
        var stack = [];
        var done = [];
        do {
            for(var x in json) {
                if(x.charAt(0) === '_') {
                    delete json[x];
                } else if(done.indexOf(json[x]) === -1 && typeof json[x] === 'object') {
                    stack.push(json[x]);
                    done.push(json[x]);
                }
            }
        } while(json = stack.pop());
    },
    
    //Validates a form before sending it to the DB
    validate: function(){
        //Validate
        if(this.gameKind == ("Naming" || "Math"))
            this._validateNamingGame();
        else if(this.gameKind == "Category")
            this._validateCategoryGame();
        
        
        if(this.valid){
            if(this.clean)
                this.saveGame();
            else
                this.saveModifiedGame();
        }
    },

    //Shows error dialog
    throwError: function(str){
        dijit.byId('tDialog').set('content', str);
        dijit.byId('tDialog').show();
        this.valid = false;
    },
    
    //Validates a Naming / Math game
    _validateNamingGame: function(){
        var data = this.gen.get("value");
        if(data.Name.length==0){
            this.throwError("Please enter a Name for this game.");
        }else if(data.Things.length<2){
            this.throwError("Please enter at least two Items.");
        }else if(data.Choices_per_round>data.Things.length){
            this.throwError("Choices per round cannot be greater than the number of Items.");
        }else if(data.Question.length==0){
            this.throwError("Please enter at least one Instruction.");
        }else{
            for(var i in data.Question){
                if(data.Question[i].length==0)
                    this.throwError("Please do not leave an Instruction blank. Either delete it, or write something.");
            }
            for(var j in data.Things){
                if(!data.Things[j].Name || data.Things[j].Name.length==0){
                    this.throwError("Please enter a Name for each Item.");
                }else if(data.Things[j].Prompt.length==0){
                    this.throwError("Please enter at least one Prompt for each Item.");
                }else{
                    for(var k in data.Things[j].Prompt){
                        if(data.Things[j].Prompt[k].length==0)
                            this.throwError("Please do not leave a Prompt blank for an Item. Either delete it, or write something.");
                    }
                }
            }
        }
    },
    
    //Validates a Category game
    _validateCategoryGame: function(){
        var data = this.gen.get("value");
        if(data.Name.length==0){
            this.throwError("Please enter a Name for this game.");
        }else if(data.Categories.length<2){
            this.throwError("Please enter at least two Categories.");
        }else{
            for(var i in data.Categories){
                if(!data.Categories[i].Name.length || data.Categories[i].Name.length==0){
                    this.throwError("Please enter a Name for each Category.");
                }else if(data.Categories[i].Exclusion_Question.length==0){
                    this.throwError("Please enter at least one Exclusion Question for each Cateogry.");
                }else if(data.Categories[i].Inclusion_Question.length==0){
                    this.throwError("Please enter at least one Inclusion Question for each Category.");
                }else if(data.Categories[i].Things.length==0){
                    this.throwError("Please enter at least one Item in each Category.");
                }else{
                    for(var h in data.Categories[i].Things){
                        if(!data.Categories[i].Things[h].Name || data.Categories[i].Things[h].Name.length==0)
                            this.throwError("Please enter a Name for each Item in each Category.");
                    }
                    for(var j in data.Categories[i].Exclusion_Question){
                        if(data.Categories[i].Exclusion_Question[j].length==0)
                            this.throwError("Please do not leave an Exclusion Question blank for a Category. Either delete it, or write something.");
                    }
                    for(var k in data.Categories[i].Inclusion_Question){
                        if(data.Categories[i].Inclusion_Question[k].length==0)
                            this.throwError("Please do not leave an Inclusion Question blank for a Category. Either delete it, or write something.");
                    }
                }
            }
        }
    },
    
    //Build the error dialog
    _buildErrorDialog: function(){
        secondDlg = new dijit.Dialog({
            title: "Error",
            style: "width: 300px;font:14px arial;background:white;",
            id: 'tDialog'
        });
        var h = dojo.create('div',{'style':'margin-left:auto;margin-right:auto;width:80px;margin-bottom:5px'},secondDlg.domNode,'last');
        var ok = new dijit.form.ToggleButton({
            label: '<span style="font-family:Arial;font-size:10px;">Ok</span>',
            showLabel: true,
            id: 'okButton'
        });
        dojo.connect(ok, "onClick", this, function(){
            dijit.byId("tDialog").hide();
            this.valid = true;
        });
        dojo.place(ok.domNode, h, 'last');
        return secondDlg
    }
});