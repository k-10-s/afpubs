/*********************************************************************

 ADOBE SYSTEMS INCORPORATED
 Copyright 1994-2008 Adobe Systems Incorporated
 All rights reserved.

 NOTICE: Adobe permits you to use, modify, and distribute this file
 in accordance with the terms of the Adobe license agreement
 accompanying it. If you have received this file from a source other
 than Adobe, then your use, modification, or distribution of it
 requires the prior written permission of Adobe.

 ---------------------------------------------------------------------

 sdkGoToBookmark.js
 
 - Javascript code created by Adobe Acrobat SDK.

*********************************************************************/


/*
 * sdkGoToBookmark.js
 * 
 * Folder Javascript Created by Adobe Acrobat SDK.
 * 
 * This JavaScript code will add a menu item "Go To Bookmark..." under Edit>Acrobat SDK JavaScript menu. 
 * The menu function looks for a bookmark matching user input in a PDF document. If found, 
 * execute the bookmark action that generally is going to a pageview.
 * 
 * The user input string is the name of a bookmark to look for. 
 * The search is case insensitive. Various format examples:
 *    < Work with the samples_guide.pdf document in SDK >
 *    "SDKJSSnippets" - get the first match in any level
 *    "Guide to SDK Samples:JavaScript Samples:Inside PDF:SDKJSSnippets" -	hierarchy, 
 *             each token in one level down. 
 *    "Guide to SDK Samples:*:SDKJSSnippets" - hierarchy, 
 *              "*" means there may be any number of levels there.
 *             
 * To cancel, press Esc on Wins or command-period on Mac. 
 */

if ( typeof sdkMenuItem == "undefined")
	var sdkMenuItem = false;
	
if (!sdkMenuItem) {
	sdkMenuItem = true;
	app.addSubMenu( { 
	   cName:"ACROSDK:JSSubMenu", 
	   cUser: "Acrobat SDK JavaScript", 
	   cParent: "Edit", 
	   nPos: 0
	});
}

// Add a menu for GetBookmarkName()
app.addMenuItem( { 
   cName: "ACROSDK:GoToBM", 
   cUser: "Go To Bookmark...", 
   cParent: "ACROSDK:JSSubMenu", 
   cEnable: "event.rc = (event.target != null);",
   cExec: "GetBookmarkName(event.target)" 
});

/**
 * Take the doc object pass to use from the menu, get the bookmark to search for
 * and pass these to GoToBookmark() 
 */
function GetBookmarkName(doc)
{
	var str = util.printf("Enter a Bookmark to find in document %s. \nUse A:B:C:D or A:*:D for hierarchy.", doc.documentFileName);
    resp = app.response({
        cTitle: "Find Bookmark",
        cQuestion: str
    });
    if ( resp != null ) {
		if(GoToBookmark(doc, resp)==null)
			app.alert("The bookmark is not found.");
	}
}


/** 
 * it search for a specific bookmark in a PDF document. If found, 
 * execute the bookmark action that generally is going to a pageview.
 * 
 * input: pdfDoc - Doc object 
 * input: bmNameToFind - string, name of a bookmark to look for. 
 *   The search is case insensitive. Various format examples:
 *    "ASFileClose" - get the first match in any level
 *    "methods:as layer methods:asfile:ASFileClose" -	hierarchy, 
 *             each token in one level down. 
 *    "methods:*:ASFileClose" - hierarchy, 
 *              "*" means there may be any number of levels there. 
 */  
function GoToBookmark(pdfDoc, bmNameToFind)
{
	// split a possible hierarchy bookmark name such A:B:C into tokens
	var tokens = bmNameToFind.split(':');
	
	// use app thermometer
	var therm = app.thermometer
	therm.duration = 10*tokens.length;
	therm.begin();
	therm.text = "Search bookmarks ... \(Cancel key: Esc on Win, command-period on Mac.\)";
	therm.value = 2;

	// search
	var nLevel = 0;
	var bmFound;
	var bmMatch;

	// go through each token to find match
	for(var i=0;i<tokens.length;i++) {

		// the first token can be in any level of bookmarks
		if(i==0) {
			// remove any star tokens in front
			while (tokens[i]=="*") {
				i++;
			}
			
			bmFound = FindBookmarkByName(pdfDoc.bookmarkRoot, tokens[i]);
		}
		// the star token can be in any level under the previous one
		else if (tokens[i]=="*" && i+1<tokens.length) { 
			bmFound = FindBookmarkByName(bmMatch, tokens[++i]);
		}
		// the token other than star must in the level next to the previous token
		else { 
			bmFound = null;
			if(bmMatch.children != null) 
			for(var j=0;j<bmMatch.children.length;j++) {
				if(bmMatch.children[j].name.toLowerCase() == tokens[i].toLowerCase()) {
					bmFound = bmMatch.children[j];
					break;
				}
			}
		}

		// substitution if found
		if(bmFound != null )
			bmMatch = bmFound;
		// not found, end the process, return null.
		else {
			therm.text = " ";
			therm.end();
			return null;
		}

		// set current value of thermometer
		therm.value = 10*(i+1);
	}

	therm.text = " ";
	therm.end();

	// if found, execute its action.
	bmFound.execute();

	// return the bookmark
	return bmFound; 
}		
		 

function FindBookmarkByName(bmHead, bmNameToFind)
{
	// check this bookmark itself
	if(bmHead.name.toLowerCase() == bmNameToFind.toLowerCase())
		return bmHead;

	// check its children
	if(bmHead.children != null) 
		for(var i=0;i<bmHead.children.length;i++) {
			// recurse
			var bmMatch = FindBookmarkByName(bmHead.children[i], bmNameToFind);
			
			// return if found a match
			if(bmMatch != null ) return bmMatch;
			
			// check if the search is canceled.
			if(app.thermometer.cancel) {
				return null;
			}
		}

	// not found 
	return null;
}
