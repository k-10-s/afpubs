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

 sdkPresentationNote.js

 - Folder Javascript sample created by Acrobat SDK.

*********************************************************************/


/* 
 * sdkPresentationNote.js
 * Folder JavaScript sample Created by Acrobat SDK.
 * 
 * This JavaScript code will add a menu item "Presentation Note..." under 
 * the "Advanced" menu, and the associated menu function will create a temporary 
 * note on top of the front file to show a schedule note. 
 * After the user has entered a number of minutes before start of the presentation, 
 * the note will display and the time shown in the note will be constantly updated 
 * until the specified time period is end.
 * The user may click the menu item again to remove the note anytime.
 */

/*
 * Use of an object to emulate a unique namespace.
 *
 * Object literals act like global variables
 * defined within this particular namespace.
 */
if (typeof ACROSDK == "undefined")
	var ACROSDK = {};
	
// global variables
ACROSDK.targetDoc;
ACROSDK.timeStart;

ACROSDK.nWaitingMin;
ACROSDK.nRemainingMin;
ACROSDK.nIntervalSec = 0.5;
ACROSDK.nIndex;
ACROSDK.bQuit = true;
	
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

// Add a menu for PresentationNote()
app.addMenuItem( { 
   cName: "ACROSDK:PresentationNote", 
	cUser: "Presentation Note...", 
	cParent: "ACROSDK:JSSubMenu", 
   cEnable: "event.rc = (event.target != null);",
   cExec: "PresentationNote(event.target);" });

/**
 * main entry
 */
function PresentationNote(doc)
{
	// check flag to toggle start / quit the presentation note. 
	if(ACROSDK.bQuit == true)
		ACROSDK.bQuit = false;
	else {
		ACROSDK.bQuit = true;
		return 1;
	}
		 
	// ask user to input a waiting time length
	ACROSDK.nWaitingMin = app.response({
		cQuestion: "A temporary note will be created " +
			" on top of the front file to show a schedule note." +
			" You can click the menu item again to remove the note anytime." +
			"\nEnter a number of minutes before start of the presentation:",
		cTitle: "Presentation Note",
		cDefault: "1",
	});
	
	if ( ACROSDK.nWaitingMin == null){
		ACROSDK.bQuit = true;
		return 1;
	} else if (isNaN(ACROSDK.nWaitingMin)) {
		app.alert("Must enter a number.")
		ACROSDK.bQuit = true;
		return 1;
	}

   try {
      // get page box
      ACROSDK.targetDoc = this;
      var aRect = doc.getPageBox("Media",doc.pageNum);
   
      // create a text field
      var nHeight = 230;
      var nAdgeX = 100;
      var nAdgeY = 100;
   
      var x1 = aRect[0]+nAdgeX;
      var x2 = aRect[2]-nAdgeX;
      var y1 = aRect[1]-nAdgeY;
      var y2 = y1-nHeight;
      var ft = doc.addField("newNote", "text", doc.pageNum, [x1,y1,x2,y2]);
   
      ft.fillColor = ["RGB",1,0.855,1];;
      ft.strokeColor = ["RGB",0,0,1];
      ft.borderStyle = border.i;
      ft.textColor = color.blue;
      ft.richText = true; 
      ft.multiline = true; 
      ft.readonly = true; 
   
      // set rich text of the field
      Strline1 = "Presentation\r"; 
      Strline2 = "will start\r"; 
      if (ACROSDK.nWaitingMin>1)
         Strline3 = "in " + ( 1 + Math.floor(ACROSDK.nWaitingMin));
      else
         Strline3 = "in " + 1;
      if (ACROSDK.nRemainingMin<=1) 
         Strline3 = Strline3 + " minute\r";
      else 
         Strline3 = Strline3 + " minutes\r";
      ft.richValue = ComposeRichText(3);
   
      // timer
      ACROSDK.timeStart = new Date();
      ACROSDK.nIndex = 0;
      ACROSDK.bQuit = false;
   
      noteTimer = app.setInterval("UpdateNote()", ACROSDK.nIntervalSec*1000 );
   
      // set time out
      stopNoteTimer = app.setTimeOut("Clean();",ACROSDK.nWaitingMin*60000+30000);
   } catch (e) {
		console.println("Error in PresentationNote.");
   }

	return 0;
}

/**
 * internal function to compose the various rich text
 */
function ComposeRichText(nShow)
{
	try {
      var spans = new Array();
   
      spans[0] = new Object();
      spans[0].textColor = color.blue;
      spans[0].textSize = 40;
      spans[0].alignment = "center";
      spans[0].text = "";
   
      spans[1] = new Object();
      spans[1].textColor = color.blue;
      spans[1].textSize = 40;
      spans[1].alignment = "center";
      spans[1].text = "";
   
      spans[2] = new Object();
      spans[2].textColor = color.red;
      spans[2].textSize = 45;
      spans[2].alignment = "center";
      spans[2].text = "";
   
      if(nShow>0) spans[0].text = Strline1;
      if(nShow>1) spans[1].text = Strline2;
      if(nShow>2) spans[2].text = Strline3;
   } catch (e) {
		console.println("Error in ComposeRichText.");
   }

	return spans;
}


/**
 * internal function executed after every time interval
 */
function UpdateNote()
{
   try {
      // if Quit flag is on, just quit. 
      if (ACROSDK.bQuit == true ) {
         app.clearInterval(noteTimer);
         app.clearTimeOut(stopNoteTimer);
         if (ACROSDK.targetDoc != null) ACROSDK.targetDoc.removeField("newNote");
         return 1;
      }
      
      // get current time
      var timeNow = new Date();
   
      // get the time passed in seconds
      var nSpentSec = Math.floor((timeNow - ACROSDK.timeStart)/1000);
   
      // get the remaining time in minutes
      ACROSDK.nRemainingMin = 1 + Math.floor((ACROSDK.nWaitingMin*60 - nSpentSec)/60);  
   
      // always increase the index
      ACROSDK.nIndex++;
   
      // show various text according to the remaining time and the index.
      var nCycle = 8;
      if (4 <= ACROSDK.nIndex%nCycle && ACROSDK.nIndex%nCycle < 6)  
         ACROSDK.targetDoc.getField("newNote").hidden = false;
   
      else if (0 <= ACROSDK.nIndex%nCycle && ACROSDK.nIndex%nCycle < 4) {
         ACROSDK.targetDoc.getField("newNote").hidden = false;
         if (ACROSDK.nRemainingMin>0) {
            Strline3 = "in " + ACROSDK.nRemainingMin;
            if (ACROSDK.nRemainingMin<=1) 
               Strline3 = Strline3 + " minute\r";
            else 
               Strline3 = Strline3 + " minutes\r";
         }
         else
            Strline3 = "at any moment";
         ACROSDK.targetDoc.getField("newNote").richValue = ComposeRichText(ACROSDK.nIndex%nCycle);
      }
      else 
         ACROSDK.targetDoc.getField("newNote").hidden = true;
   } catch (e) {
		console.println("Error in UpdateNote.");
   }

	return 0;
}


/**
 * internal function to end the timer and remove the note 
 */
function Clean()
{
	try {
		app.clearInterval(noteTimer);
		app.clearTimeOut(stopNoteTimer);
		if (ACROSDK.targetDoc != null) 
		   ACROSDK.targetDoc.removeField("newNote");
		   
		ACROSDK.targetDoc.dirty = false;
		ACROSDK.bQuit = true;
	} catch (e) {
		console.println("Error in Clean.");
	}
}



