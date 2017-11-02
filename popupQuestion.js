//app.addMenuItem({cName:"JS Ref", cParent:"Help", cExec:"app.alert("Hello world!!!");" });
	
	function HelloWorldProc()
{
    app.alert("Hello World" + this.info.creationDate);
	
}
app.addMenuItem({cName: "Hello", cParent: "File", cExec: "HelloWorldProc()"});
	
	
iTrustGoogle = app.trustedFunction(
    function()
    {
        //app.alert("trust me?");
        //Net.HTTP.request({cVerb:"GET", cURL:"http://google.com"});
        //app.alert("if you see this, then yess");
		
		
		
		
		var cResponse = app.response({
		cQuestion: "How are you today?",
		cTitle: "Your Health Status",
		cDefault: "Fine",
		cLabel: "Response:"
		});
		if (cResponse == null)
		app.alert("Thanks for trying anyway.");
		else
		app.alert("You responded, \""+cResponse+"\", to the health " + "question.",3);
		//var myTO = app.setTimeOut("app.alert(\"This should appear after a delay.\") ; app.clearTimeOut(myTO) ;", 5000) ;
		//var d = app.activeDocs; // get array of open docs
		// loop throgh the open doc array
		//for (var i = 0; i < d.length; i++)
		//app.alert("Creation date is" + d[i].info.creationDate);
	
		//app.alert("Creation date is" + app.activeDocs);
		//app.alert(this.info.creationDate);
	
	}
);

iTrustGoogle();
