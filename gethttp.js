myTrustedHTTPTest = app.trustedFunction( function ()
{
  app.beginPriv();
  console.println("start testing HTTP ...");
  var myTrustedRetn = Net.HTTP.request({
  cVerb: "GET",
  cURL: "http://google.com",
  oHandler:
  {
     response: function(msg, uri, e)
     {
        if(e != undefined && e.error != 405) 
		    {
          app.alert("Failed: "+ e);
        } 
        else app.alert("connected");
      }
  }        
}

 console.println("end testing HTTP ...");
 console.println("and result was " + myTrustedRetn.aHeaders);
 app.endPriv();
 return myTrustedRetn;
 };
myTrustedHTTPTest();
