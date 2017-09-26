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

 sdkPresentationMonitor.js

 - Folder Javascript sample created by Acrobat SDK.

*********************************************************************/


/* 
 * sdkPresentationMonitor.js
 * Folder Javascript Created by Acrobat SDK.
 * 
 * This folder level JavaScript sample will create a set of tools to monitor 
 * the progress of a presentation using PDF slides.
 * This JavaScript code will add a menu item "Presentation Monitor..." under 
 * the Edit>Acrobat SDK JavaScript menu. Click it to get a dialog box to enter 
 * a number of minutes you plan to have for the presentation. After that a monitor 
 * shown in the top of slide page will start. When you go through the pages, you can 
 * use the following tools:
 * - a message showing number of pages untouched.
 * - a message showing time left.
 * - a time progress bar.
 * - a set of page icons: 
 *    The page icons with the different colors can indicate which page is current,
 *    and which pages have been navigated. When the mouse enter/exit a page 
 *    icon, the page image will be shown/hidden in the top left corner. Click 
 *    a page icon, you can go to that page.
 * - the check box: check/uncheck to toggle "show" or "hide" the time bar and page icons.
 * - the quit button with  "X": click to quit the monitor tool.
 * 
 * Note: 
 * The display may be slow since a great number of form field are added through JavaScript. 
 * There is a known issue. When the top margin is not enough, this tool set may overlap the 
 * slide contents. Some improvement may be needed in that situation, e.g. to relocate the monitor 
 * tool set, or first to draw a blank field in the top portion of each slide. As a sample, 
 * the code improvement is not provided.
*/

/*
 * Use of an object to emulate a unique namespace.
 *
 * Object literals act like global variables
 * defined within this particular namespace.
 */
if (typeof ACROSDK == "undefined")
	var ACROSDK = {};
	
// the PDF presentation
ACROSDK.targetDoc = null;

// time 
ACROSDK.nTotalMin;
ACROSDK.nIntervalSecond = 1;
ACROSDK.nSpentSec;
ACROSDK.nMaxTotalTimeMin = 120;  
ACROSDK.nMaxOvertimeMin = 10;  
ACROSDK.oTimeStart;

// dimension
ACROSDK.inch = 72;
ACROSDK.barWidth;

// UI 
ACROSDK.aPagesFlag = new Array();
ACROSDK.bHidden;
ACROSDK.bHotButton;

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

// Add a menu for ProgressMonitor() 
app.addMenuItem( { 
   cName: "ACROSDK:TimeMonitor", 
   cUser: "Presentation Monitor...", 
   cParent: "ACROSDK:JSSubMenu", 
   cEnable: "event.rc = (event.target != null);",
   cExec: "ProgressMonitor(event.target);" 
});


/**
 * main entry 
 */
function ProgressMonitor(doc)
{
	// if time monitor has already created, do nothing.
	if(doc.getField("timeMonitorFields")) return;

	// ask user to input a time length
	ACROSDK.nTotalMin = app.response({
		cQuestion: "Enter the total minutes \(<120\) you will have for the presentation:",
		cTitle: "Time Monitor",
		cDefault: "1",
		cLabel: "Response:"
	});
	
	if ( ACROSDK.nTotalMin == null){
		return;
	} else if (isNaN(ACROSDK.nTotalMin)) {
		app.alert("Must enter a number.")
		return;
	} else if (ACROSDK.nTotalMin>ACROSDK.nMaxTotalTimeMin) {
		app.alert("Maximum time is 120 minutes.")
		return;
	}

	// initialize global variables
	ACROSDK.nSpentSec = 0;
	ACROSDK.targetDoc = this;
	ACROSDK.bHidden = false;
	ACROSDK.bHotButton = false;

	// initialize page flags
	for(var i=0;i<doc.numPages;i++) 
		ACROSDK.aPagesFlag[i] = false;

   try {
      // set time started
      ACROSDK.oTimeStart = new Date();
   
      // set a timer
      runTimeBar = app.setInterval("TimeGoing()", ACROSDK.nIntervalSecond*1000 );
   
      // set time out for the timer
      stopTimeBar=app.setTimeOut("TimeOutProc(ACROSDK.targetDoc);",(ACROSDK.nTotalMin)*60000+ACROSDK.nMaxOvertimeMin*60000);
   
      // set doc actions to clean up when doc is closed
      doc.setAction("WillSave", "AskAndClean(ACROSDK.targetDoc);");
      doc.setAction("WillClose", "AskAndClean(ACROSDK.targetDoc);");
   } catch (e) {
      console.println("Error in timer set up");	
   }
}

/** 
 * privileged function
 */
trustedBII = app.trustedFunction(
   function( f, nPage )
   {
     app.beginPriv();
     f.buttonImportIcon( this.path, nPage );
     app.endPriv();
   }
);
  
/**
 * function to create time progress bar and page icons 
 */
function CreatebarAndPages(doc, nPage)
{
   try {
      // flag
      ACROSDK.aPagesFlag[nPage] = true;
      
      // get page box
      var aRect = doc.getPageBox("Crop",nPage);
      
      // cancel button ---
      var barHeight = 0.25*ACROSDK.inch;  
      var x1 = aRect[2]-10-barHeight;
      var x2 = x1 + barHeight;
      var y1 = aRect[1]-5;
      var y2 = aRect[1]-5-barHeight;
      var fCancel = doc.addField("newTimerShort.btnCancel."+nPage, "button", nPage, 
                     [x1, y1, x2, y2] )
      fCancel.setAction("MouseUp", "AskAndClean(ACROSDK.targetDoc);");
      fCancel.buttonSetCaption("X");
      fCancel.textColor = ["RGB",1,0,0];;
      fCancel.strokeColor = ["RGB",1,0,0];
      
      /*
       * toggle hide/show button --- 
       * we create the same button in every page, so we can get general control.  
       */
      if (ACROSDK.bHotButton == false) {
         var j;
         for (j=0;j<doc.numPages;j++) {	
            
            var fToggle = doc.addField("newTimerShort.btnToggle", "checkbox", j, 
                           [x1, aRect[1]-10-barHeight, x2, aRect[1]-10-2*barHeight] );
            fToggle.checkThisBox(0,true);
            fToggle.setAction("MouseUp", 'var f = this.getField("timeMonitorFields"); f.hidden = !(this.getField("newTimerShort.btnToggle").isBoxChecked(0)); ');
            fToggle.strokeColor = ["RGB",0,0,1];
         }
         ACROSDK.bHotButton = true;
      }
            
      // time progress bar --- 
      ACROSDK.barWidth = (aRect[2] - aRect[0])*3/4;
      x2 = aRect[2] - 0.5*ACROSDK.inch;
      x1 = x2 - ACROSDK.barWidth;
      y1 = aRect[1] - 6;
      y2 = y1 - barHeight;
      
      px1 = x1;
      px2 = x2;
      py1 = y2 - 6;
      py2 = y2 - 6 - barHeight;
      var pdx = ACROSDK.barWidth/(doc.numPages);
      
      // the static bar as a base
      var fStaticBar = doc.addField("timeMonitorFields.rectBase"+nPage, "button", nPage, 
                     [x1, y1, x2, y2] )
      fStaticBar.borderStyle = border.s;
      fStaticBar.fillColor = ["RGB",1,1,.755];
      fStaticBar.strokeColor = color.black;
      
      // the moving bar to show the time progress
      var fMovingBar = doc.addField("timeMonitorFields.rectMoving."+nPage, "button", nPage, 
                        [x1, y1, x1+2, y2] )
      fMovingBar.borderStyle = border.s;
      fMovingBar.fillColor = color.blue;
      fMovingBar.strokeColor = color.blue;
      
      // time message --- 
      var fTimeMessage = doc.addField("newTimerShort.txtTimeLeft", "text", nPage, 
                     [aRect[0]+10, y1, aRect[0]+1.8*ACROSDK.inch, y2] )
      fTimeMessage.borderStyle = border.u;
      fTimeMessage.textColor = color.blue;
      
      // page message --- 
      var fPageMessage = doc.addField("newTimerShort.txtPagesLeft", "text", nPage, 
                     [aRect[0]+10, y2-4, aRect[0]+1.6*ACROSDK.inch, y2-4-barHeight] )
      fPageMessage.borderStyle = border.u;
      fPageMessage.textColor = ["RGB",0.3,0.6,0.2];
      
      // page image button --- 
      var fPageImage = doc.addField("newTimerShort.btnPageImage."+nPage, "button", 
                     nPage, [aRect[0]+10, py2,aRect[0]+ACROSDK.barWidth/2, py2-ACROSDK.barWidth/3] )
      fPageImage.readonly = true;
      fPageImage.borderStyle = border.i;
      fPageImage.buttonPosition = position.iconOnly;
      fPageImage.hidden = true;
      fPageImage.fillColor = color.gray;
      
      // page rectangles --- 
      var pdWidth = Math.floor(ACROSDK.barWidth/(doc.numPages-1));
      if (pdWidth > barHeight) pdWidth = barHeight;
      
      for (j=1;j<=doc.numPages;j++) {
         var fPageRectangle = doc.addField("timeMonitorFields.rectPages." + j, "button", nPage, 
            [px1+j*pdx-pdWidth, py1, px1+j*pdx, py2] );
         fPageRectangle.textSize = 0; // auto sized
         fPageRectangle.textColor = color.black;
         fPageRectangle.buttonSetCaption(j); 
         fPageRectangle.borderStyle = border.s;
         
         fPageRectangle.fillColor = ["RGB",1,1,.855];
         fPageRectangle.strokeColor = color.black;
         
         // set the button actions ---
         // go to the page image when the mouse clicks.
         var fname = "newTimerShort.btnPageImage." + nPage;
         var jsCode =  'var f = this.getField("' + fname + '").hidden = true; this.pageNum = ' + (j-1);
         fPageRectangle.setAction("MouseUp",jsCode);
      
         // show the page image when the mouse enters
         jsCode = 'var f = this.getField("' + fname + '");' 
                  + 'f.hidden = false; trustedBII( f,' + (j-1) + ');';
         
         fPageRectangle.setAction("MouseEnter",jsCode);
         
         // hide the image when the mouse exits.
         jsCode = 'var f = this.getField("' + fname + '");'
                  + 'f.hidden = true;';
         fPageRectangle.setAction("MouseExit",jsCode);
      }
   } catch (e) {
      console.println("Error in create field, bar, and page icons");	
   }
}


/**
 * function for the timer.
 * it will be executed after every time interval, say 1 second. 
 */
function TimeGoing()
{
   try {
      // get time Elapsed from a Date funtion
      var nSpentSec = Math.floor(MilliSecondsElapsed()/1000);
      
      // create "time monitor" fields in the page if they are not done.
      if (ACROSDK.aPagesFlag[ACROSDK.targetDoc.pageNum] == false) 
            CreatebarAndPages(ACROSDK.targetDoc, ACROSDK.targetDoc.pageNum);
      
      this.getField("timeMonitorFields").hidden = ACROSDK.bHidden;
      
      // update pages icons
      var nLeftPages = 0;
      for (var i=0;i<ACROSDK.targetDoc.numPages;i++) {
         if (ACROSDK.aPagesFlag[i] == false) 
            nLeftPages++;
         else if (i==ACROSDK.targetDoc.pageNum) 
            ACROSDK.targetDoc.getField("timeMonitorFields.rectPages." + (i+1)).fillColor = ["RGB",1,.855,1];
         else 
            ACROSDK.targetDoc.getField("timeMonitorFields.rectPages." + (i+1)).fillColor = ["RGB",.7,1,1];
       }
      
      //  message showing pages left
      var sP = ACROSDK.targetDoc.getField("newTimerShort.txtPagesLeft");
      sP.value = nLeftPages + " page\(s\) left.";
      
      // update time monitor bar
      var sT = ACROSDK.targetDoc.getField("newTimerShort.txtTimeLeft");
      var sB = ACROSDK.targetDoc.getField("timeMonitorFields.rectBase" + ACROSDK.targetDoc.pageNum);
      var sM = ACROSDK.targetDoc.getField("timeMonitorFields.rectMoving." + ACROSDK.targetDoc.pageNum);
      
      var gdelta =  ACROSDK.barWidth/(ACROSDK.nTotalMin*60/ACROSDK.nIntervalSecond);
      var sMrect2 = sM.rect[0]+gdelta*nSpentSec;
      if (sMrect2 < sB.rect[2]) {
         sM.rect = [sM.rect[0],sM.rect[1],sMrect2,sM.rect[3]]; 
      
         var nLeftMin = Math.floor((ACROSDK.nTotalMin*60 - nSpentSec)/60);  
         var nLeftSec = ACROSDK.nTotalMin*60 - nSpentSec - nLeftMin*60;
         if (nLeftSec<10) nLeftSec = "0" + nLeftSec; 
         sT.value = nLeftMin + ":" + nLeftSec + " minute\(s\) left";
      } else {
         sM.rect = [sM.rect[0],sM.rect[1],sB.rect[2],sM.rect[3]]; 
         sM.buttonSetCaption("Time is up !");
         sM.textColor = color.red;
      
         var nOverMin = Math.floor((nSpentSec - ACROSDK.nTotalMin*60)/60);  
         var nOverSec = nSpentSec - ACROSDK.nTotalMin*60 - nOverMin*60;
         if(nOverSec<10) nOverSec = "0" + nOverSec; 
         sT.value = nOverMin + ":" + nOverSec + " overtime";
         sT.textColor = color.red;
      }
      
      ACROSDK.bHidden = !(this.getField("newTimerShort.btnToggle.").isBoxChecked(0));
   } catch (e) {
      console.println("Error in timer execution function");	
   }
}


/**
 * function to get user comfirmation 
 */
function AskAndClean(doc)
{
	// if it's already cleaned, do nothing.
	if(!doc.getField("timeMonitorFields")) return;

	// ask user for confirmation
	var nButton = app.alert({
		cMsg: "Do you want to quit time monitor?",
		cTitle: "Time Monitor",
		nIcon: 2, nType: 2
	});
	
	if ( nButton != 4 ) return;

	// clean  
	try {
		app.clearInterval(runTimeBar);
		app.clearTimeOut(stopTimeBar);
		doc.removeField("timeMonitorFields");
		doc.removeField("newTimerShort");
		ACROSDK.nSpentSec = 0;
	} catch (e) {}
}

/**
 * function for the timer
 */
function TimeOutProc(doc)
{
	try {
		app.clearInterval(runTimeBar);
		app.clearTimeOut(stopTimeBar);
		doc.removeField("timeMonitorFields");
		doc.removeField("newTimerShort");
		ACROSDK.nSpentSec = 0;
	} catch (e) {}
}

/**
 * function for the timer
 */
function MilliSecondsElapsed()
{
	oTimeNow = new Date();
	return (oTimeNow - ACROSDK.oTimeStart);
} 

