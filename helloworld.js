//app.addMenuItem({cName:"JS Ref", cParent:"Help", cExec:"app.alert("Hello world!!!");" });
	
iTrustGoogle = app.trustedFunction(
    function()
    {
        app.alert("trust me?");
        Net.HTTP.request({cVerb:"GET", cURL:"http://google.com"});
        app.alert("if you see this, then yess");
    }
);

iTrustGoogle();
