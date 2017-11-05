//TODO: Get correct stream data. Embedding actual 20x20 icon hex here is sadly way easier then pulling in a jpeg...
//https://forums.adobe.com/thread/998367
var iconStream = "ff9f4e7bffa54b7fffa84880ffac4481ffb04182ffb23e83ffb53c84ffb83785ffb93785ffba3685ffba3685ffba3685ffb83a84ffb53a85ffb23e83ffb04182ffad4381ffa94780ffa44b7fffa04c7cffa54b7fffaa4680ffad4381ffb23e83ffb63c83ffb93785ffbc3086ffbd2d86ffc2428dffc33e8cffc02c87ffbf2c86ffbe2c87ffbc3086ffb93686ffb63b84ffb23e83ffae4282ffa94780ffa6497fffa84880ffac4481ffb24083ffb83a84ffba3485ffbe2d86ffc12588ffc62d8bffe196bfffebbfd6ffd877adffc5238affc32289ffc12788ffbe2d86ffba3386ffb83a84ffb23e83ffad4382ffaa4680ffac4481ffb13f83ffb63b84ffbb3286ffbf2a86ffc32288ffc7258affe08ab9fff5dce9fff9f5f8fff0c9dcffd96eaaffc71b88ffc51e88ffc32288ffc02a88ffbb3286ffb83a84ffb13f83ffad4382ffaf4182ffb53c83ffba3685ffbf2a86ffc42288ffc61c88ffdd78b1fff3d2e4fffcf8fbfffffffffffaf5f7fff0c3dbffda6aaaffc9198affc61c88ffc42288ffc02a88ffba3386ffb53c84ffb04182ffb23e83ffb83a84ffbe2d86ffc22588ffc61e89ffca168affd7499efff0b7d6fffaf3f7fffefefefffefefefff9f2f6fff1c6dcffde72afffc91a8affc61c89ffc32288ffbe2c87ffb83986ffb43e83ffb53c84ffba3386ffc02788ffc61e88ffc9198affcc138bffd1158effdf4fa5fff1b5d7fff9f2f6fffefefefffefefefffaf3f7fff1c6ddffdd6babffc9188affc61e89ffc12788ffba3386ffb63b84ffb63a84ffbd2d86ffc22588ffc71a89ffcc158affcf0f8bffd10a8cffd50c8fffe449a8fff4b6d8fffbf6f8fffefefefffffffffff9f2f6fff0c2daffdb66a8ffc81a89ffc42288ffbd2f86ffb93886ffb93785ffcb5d9cffe39cc2ffe8a1c7ffeb9ec8ffec9cc8ffed97c8ffef94c7fff19bcbfff6c9e2fffaf5f8fffefefefffffffffffefefffff9f2f6fff0c3daffdb6facffc52289ffbf2c87ffb93485ffba3386ffd57dadfff4e7effffaf6f9fffaf6f9fffaf6f9fffaf6f9fffaf6f9fffaf6f9fffbf7fafffcfcfdfffefefefffffffffffffffffffdfffffffaf5f7fff1c9ddffd974acffc02e88ffba3386ffba3386ffd781aefff7eef3fffefefefffefefefffefefefffefefefffefefefffefefffffefefffffefefefffffffffffffffffffffffffffdfffffffdfefefff7f0f4ffe8abcbffc02e88ffba3386ffb93686ffd77faffff8f0f3fffffffffffffffffffffffffffffffffffdfffdfffdfffdfffffffefffffffffffffffffffffffffffffffffffefefefffbf8f9fff3d3e3ffda7ab0ffc02a88ffba3386ffb93686ffcd66a0ffe9aeccffedb4d2ffefb1d2fff1aed2fff3abd2fff3a8d1fff4abd5fff7d2e6fffbf7fafffefefefffffffffffefefefffaf5f7fff4cee1";  
var redIcon =  
{  
    count: 0,  
    width: 20,  
    height: 20,  
    read: function(nBytes)  
    {  
        return iconStream.slice(this.count, this.count += nBytes);  
    },  
    GetIcon: function() {  
      this.count = 0;  
      return this;  
    }  
};  



//Main Function, called on button click below 
function ePubsCheck()
{
	app.beginPriv();
	//Prompt user to make sure document provided title is right. Some docs may not be embedded with it
	var selfCheckResponse = app.alert(
	{ 
		cMsg: "Self reported title: " + this.info.title + "\n Is this correct?",
		cTitle: "Version Self Check", 
		nIcon: 2, nType: 2 
	});
	//3 = No, per SDK docs.
	if ( selfCheckResponse == 3 ) 
	{
		while (cResponse == null || cResponse == "")
		{
			var cResponse = app.response(
			{
				cQuestion: "Please enter document title, no spaces\nEx: \"afi1-1\" or \"af707\"",
				cTitle: "Pub Verification",
				//cDefault: "",
				cLabel: "Title:"
			});
			if (cResponse == null || cResponse == "")
				app.alert("You didnt enter anything....");
		}
		app.alert("You entered " + cResponse,3);
	}
	
	//Error checking... 	
	if(typeof(trusted_ePubsCheck) == "undefined")
		app.alert('External support function "trusted_ePubsCheck" not found\n This plugin isnt going to work...',0);
	else if(app.viewerType == "Reader")
		app.alert("This checker doesnt work with Adober Reader... =(\n\nTry Running in Adobe Acrobat Professional (Part of Standard AF SDC)" , 0);
	else
	{
		app.alert("CreationDate:\n\n" + this.info.creationDate,3);
		var webRequestReturn = Net.HTTP.request
		({
			cVerb:"GET", 
			//future cURL: http://www.e-publishing.af.mil/#/?view=search&keyword=*********&isObsolete=false&modID=449&tabID=71
			cURL:"http://google.com",
			oHandler:
			{
				response: function(msg, uri, e)
				{
					if(e != undefined && e.error != 405)
						app.alert("Failed: "+ e, 0);
					else 
						app.alert("connected", 3);
				}
			}		
        });
    } 	        
	app.endPriv();
}
var trusted_ePubsCheck = app.trustedFunction(ePubsCheck);		
	

//***************Script really starts here....everything else is just a pre-definition**************
app.addToolButton({
		cName: "epubs",
		oIcon: redIcon,
		cExec: "trusted_ePubsCheck()",
		cTooltext: "Check E-Pubs",
		cMarked: false,
		cEnable: true,
		nPos: 0
	});

	
