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

 SDKSilentPrint.js

 - Folder level Javascript code created by Adobe Acrobat SDK.
 
 *********************************************************************/
 
 
 /*
  * The sample will add "Silent Print" under Acrobat File menu. 
  * Click it to print the front document to the default printer without user interface.
  * It works for Reader, too. 
  * 
  * See Acrobat JavaScript reference and guide SDK documents for further information.
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

/*
 * Add a menu item
 * you can execute this menu item from other programs such as IAC VB / VC code.
 */
app.addMenuItem( { 
	cName: "ACROSDK:SilentPrint", 
	cUser: "Silent Print", 
	cParent: "ACROSDK:JSSubMenu",
   cEnable: "event.rc = (event.target != null);",
   cExec: "JSSilentPrint(event.target)" 
});


/**
 * trustedPrint function: Exercise the print function in the privileged context
 * 
 * @param doc The Doc object of the target document
 * @param pparam The PrintParams object containing print settings
 */
trustedPrint = app.trustedFunction(
	function(doc, pparams) {
		app.beginPriv();
		doc.print(pparams);
		app.endPriv();
	}
);

/**
 * Main function: Print silently
 *
 * @param theDoc The event target of executing the menu item of this sample.
 */
function JSSilentPrint(theDoc)
{
	// get the printParams object of the default printer
	var pp = theDoc.getPrintParams();

	// print all pages.
	// You can print certain pages using code:
	//    pp.firstPage = theDoc.pageNum1;
	//    pp.lastPage = theDoc.pageNum2;

	// silent print,  
	// you can also try .automatic instead of .silent
	pp.interactive = pp.constants.interactionLevel.silent;

	// set flag value which may include many options.
	// here we enable automatic paper tray selection
	var fv = pp.constants.flagValues;
	pp.flags |= fv.setPageSize;

	// Print to the default printer without invoking the print dialog
	trustedPrint(theDoc, pp);
}



