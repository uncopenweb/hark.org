/**
 * Handles auth & builds GameExplorer on editor.html.
 *
 * Copyright UNC Open Web Team 2010, 2011. All Rights Reserved.
 */
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('org.hark.widgets.GameExplorer');
dojo.require('org.hark.pages.common');
dojo.require('dojo.i18n');

var editor = {
    explorer: null,
    
    init: function(){
        // Listen for auth pub
        dojo.subscribe('/uow/auth',this,"onAuth");
    },
    
    // Build editor when authed
    onAuth: function(user) {
        if(user){
            // build GameExplorer
            var explorer = new org.hark.widgets.GameExplorer({
                user:user.email
            });
            dojo.place(explorer.domNode, "middle_container", "first");
            dojo.destroy("login_prompt");
            dojo.style(explorer.domNode, 'display', 'block');
        }else{
            this.onNoAuth();
        }
    },
    
    // Show log in prompt when not authed
    onNoAuth: function() {
        dojo.create("div",{
            id:"login_prompt",
            "class":"prompt",
            innerHTML:"Please log in using the menubar above to continue."
        },"middle_container","first");
    }
};

dojo.ready(editor, function() {
    // do common setup
    var def = org.hark.init('games');
    def.then(dojo.hitch(this,"init"));
});