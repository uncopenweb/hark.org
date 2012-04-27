/**
 * Game catalog controller.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require('org.hark.widgets.GameEditor');
dojo.require('org.hark.pages.common'); 

var form = {
    editor: null,
    
    // Kick things off when authed
    onAuth:function(user){
        if(user){
            // destroy login prompt
            dojo.destroy("login_prompt");
            var id = this.aquireUrlParams("dataID");
            var kind = this.aquireUrlParams("kind");
            // If we are editing an existing game...
            if(id){
                // build an editor and pass in the dataId of game
                this.createEditor(null, id, kind);
            // If we are creating a new game...
            }else{
                //show schema edit div
                dojo.style("schemaDiv","display","block");
                //Build schema combobox
                this.loadSchemas();
            }
        }else{
            this.onNoAuth();
        }
    },
    
    // Show log in prompt when not authed
    onNoAuth: function(){
        dojo.create("div",{
            id:"login_prompt",
            "class":"prompt",
            innerHTML:"Please log in using the menubar above to continue."
        },"middle_container","first");
    },
    
    // Builds ComboBox of schema type choices
    loadSchemas: function(){
        uow.getDatabase({
            database: 'harkhome', 
            collection: "gameSchemas"}).addCallback(dojo.hitch(this, function(db) {
            var data = {
                identifier:"kind",
                label: "name",
                items: []
            };
            db.fetch({
                save:true,
                onItem: function(item){
                    data.items.push({name:item.kind, kind:item.kind});
                },
                onComplete: dojo.hitch(this,function(){
                    // build combo box
                    var store = new dojo.data.ItemFileReadStore({ data:data });
                    var comboBox = new dijit.form.ComboBox({
                        id:"typeBox",
                        name: "kind",
                        value: "Naming",
                        store: store,
                        style:"margin-left:35px"
                    });
                    dojo.place(comboBox.domNode,"create","before");
                    
                    // connect to onclick
                    dojo.connect(dojo.byId("create"),"onclick",this,function(){
                        this.createEditor(true);
                    });
                })
            });
        }));
    },
    
    // Builds the actual editor
    createEditor: function(clean, id, kind){
        if(this.editor){
            dojo.destroy(this.editor.domNode);
            dojo.destroy(this._editNum);
        }
        if(clean){
            this._editNum = dojo.create("div",{"class":"editNum",innerHTML:"2. Fill out the form & click Save!"},"create","after");
            var v = dijit.byId("typeBox").attr("value");
            this.editor = new org.hark.widgets.GameEditor({
                  clean:true,
                  gameKind:v,
                  style:"margin-left:35px"
            });
            dojo.place(this.editor.domNode, "schemaDiv", "last");
        }else{
            this.editor = new org.hark.widgets.GameEditor({
                gameDataId:decodeURI(id),
                gameKind:kind
            });
            dojo.style("editDiv","display","block");
            dojo.place(this.editor.domNode, "editDiv", "last");
        }
        
    },
    
    // Grabs url params
    aquireUrlParams: function(param){
    	param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    	var pattern = "[\\?&]"+param+"=([^&#]*)";
    	var regex = new RegExp( pattern );
    	var results = regex.exec( window.location.href );
    	if( results == null )
    		return null;
    	else
    		return results[1];
    }
}
dojo.ready(function(){
    dojo.subscribe('/uow/auth',form,"onAuth");
    var def = org.hark.init('games');
});