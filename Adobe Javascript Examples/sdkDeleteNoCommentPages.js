/*********************************************************************

 ADOBE SYSTEMS INCORPORATED
 Copyright 1998-2008 Adobe Systems Incorporated
 All rights reserved.

 NOTICE: Adobe permits you to use, modify, and distribute this file
 in accordance with the terms of the Adobe license agreement
 accompanying it. If you have received this file from a source other
 than Adobe, then your use, modification, or distribution of it
 requires the prior written permission of Adobe.

 ---------------------------------------------------------------------

 DeleteNoCommentPages.js

 - Folder-level Acrobat JavaScript file.

*********************************************************************/


/* 
 * DeleteNoCommentPages.js
 * 
 * This JavaScript adds a menu item to the Acrobat SDK JavaScript menu under the
 * Edit menu. The new "Delete Pages Without Comments" menu item deletes those pages 
 * in the current document that do not have Annotations on them.
 * 
 * This is similar to a Summarize Comments option in Acrobat 6 where only
 * those pages with comments are kept. In Acrobat 7, this option was removed.
 * This JavaScript allows you to simulate the Acrobat 6 option.
 * 
 * This script provides a status message (alert) upon completion.
 * It can be removed for silent operation needs such as batch processing.
 * 
 * The processed document is not saved. 
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

app.addMenuItem({
   cName:"ACROSDK:DeletePagesWithoutComments",
   cUser:"Delete Pages without Comments",
   cParent: "ACROSDK:JSSubMenu", 
   cExec: "mainFunction();", 
   cEnable: "event.rc = (event.target != null);" // active only with docs open
});
		
/** 
 * main function
 */
function mainFunction()
{
    try {

	    var pageDeleteCount = 0;
	    var pageKeepCount = 0;

	    this.syncAnnotScan(); 
	
	    // if there are annots in this doc then process pages 
	    if (this.getAnnots() != null) 
	    {  
	    	// for each page -- go backwards so pageNums are constant
	    	for (var p = this.numPages-1; p>=0; p--)    
	    	{ 
	    		var a = this.getAnnots({nPage: p});  
		    	
		    	// get the page's annots -- if no annots, delete it 
		    	if (a == null) 
		    	{ 
		    		this.deletePages({nStart: p, nEnd: p}); 
		    		pageDeleteCount++;  
		    	} 
		    	else // if annot on the page, keep it and count it
		    	{ 
		    		pageKeepCount++; 
		    	}  
		   }  
	      app.alert(this.title + ": " + pageDeleteCount + " page(s) deleted. " + pageKeepCount + " page(s) kept. " ); 
	    }  else { // else there are no annots 
	    	app.alert("No comments in this document. No pages deleted."); 
	    }
    }

   catch (e) 
   {
   console.println("Error during mainFunction : " + e);
   }
}