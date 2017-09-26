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

 sdkJSTextExtract.js

 - Folder Javascript Created by Acrobat SDK.
 
*********************************************************************/


/*
 * This folder level JavaScript file demonstrates how to extract the text 
 * in PDF page content and save it to a text file.
 *
 * It uses getPageNthWord to get the word one by one from the current page's text content, 
 * then creates a data object and exports it to a file.     
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

// add a menu item  to extract text. 
app.addMenuItem(  {  
	cName: "ACROSDK:ExtractText",   
	cUser: "Extract Text ...",   
	cParent: "ACROSDK:JSSubMenu", 
	cEnable: "event.rc = (event.target != null);",  
	cExec: "ExtractText();"
});  

/**
 *	function to extract the text content of the current page and save to a file.
 */ 
function ExtractText()  
{  
	try  {
		var p = this.pageNum; 
		var n = this.getPageNumWords(p);
		app.alert("Number of words in the page: " + n);

		var str = "";
		for(var i=0;i<n;i++) {
			var wd = this.getPageNthWord(p, i, false);   
			if(wd != "") str = str + wd;   
		}

		// save the string into a data object
		this.createDataObject("dobj1.txt",str);  

		// pop up a file selection box to export the data 
		this.exportDataObject("dobj1.txt"); 
		 
		// clean up
		this.removeDataObject("dobj1.txt"); 

	} catch (e)  {  
		app.alert(e)
	};  
}
 