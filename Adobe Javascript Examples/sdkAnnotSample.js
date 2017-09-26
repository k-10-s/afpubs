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

 sdkAnnotSample.js

 - Javascript code created by Acrobat SDK.

*********************************************************************/

/*
 * sdkAnnotSample.js
 * 
 * Folder level JavaScript code to exercise annotation APIs useful in 
 * reviewing workflow. It can be used with the Rights-Enabled PDF in Reader
 * as well as the regular PDF in Acrobat.
 * 
 * A new menu item is added under the Edit>Acrobat SDK JavaScript menu 
 * by this folder JS file. 
 * It will trigger a jsADM dialog to show the following functions: 
 *    Set annotations  readonly or editable.
 *    Import annotations  from a local FDF file.
 *    Export annotations  to a local FDF file.
 *    Export editable annotations  to a local FDF file.
 *  
 * To run the sample, you need a file for data repository in your environment. 
 * A default file is set for Windows in the code.
 * 
 * Trusted function is used to raise the execution privilege in Acrobat 7.
 */

/*
 * Use of an object to emulate a unique namespace.
 *
 * Object literals act like global variables
 * defined within this particular namespace.
 */
if (typeof ACROSDK == "undefined")
	var ACROSDK = {};
	
/*
 * Hard coded local file path For output FDF file.
 * The local file must have a safe path in the device-independent format, 
 * see AcroJS.pdf for details. The temp directory must exist for fdf
 * to be written to it.
 */
ACROSDK.FDFFile = "/C/temp/annotSample.fdf";

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

// add a new menu item under Edit for the sample.
app.addMenuItem( {
	cName: "ACROSDK:AnnotSample", 
	cUser: "Annotation Sample",

	// new menu item under the "Edit" menu.
	cParent: "ACROSDK:JSSubMenu",

	// enabled only if there are open PDFs.
	cEnable: "event.rc = (event.target != null);", 

	// when clicked, call an user method.
	cExec: "if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0) \
				trustedAnnotToolkit(ACROSDK.myAnnotToolkitDialog, event.target);  \
			else annotToolkit(ACROSDK.myAnnotToolkitDialog, event.target);"
} );


// trusted function wrapper for version 7 
if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0)
	trustedSaveAnnotsToFile = app.trustedFunction(saveAnnotsToFile);

/**
 * user method
 */
function saveAnnotsToFile(doc)
{
   try{ 

		doc.syncAnnotScan();

		// for Acrobat 7 to raise the execution privilege of the following code
		if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0)
			app.beginPriv();

		// save annots to file
		doc.exportAsFDF({

         // save to a fdf file with a safe path 
         cPath: ACROSDK.FDFFile,	 
   
         // not exporting form data
         aFields:[],
   
         // export all annotations
         bAnnotations: true
		}); 

		// end of raising the execution privilege
		if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0)
			app.endPriv();
			
	} catch (e) {
		console.println("error saving annots to file : " + e);
	}
}

/**
 * user method
 */
function saveEditableAnnotsToFile(doc)
{
	try{ 
		doc.syncAnnotScan();

		// declare an array to store annot properties 
		var myCopyAnnotsProps = new Array();
		var num = 0;

		// set doc.delay as true so changes won't be shown immedeately
		doc.delay = true;

		// enumerate annot objects to find read only annots.
		for (var j = 0; j < doc.numPages; j++) {
			var annots = doc.getAnnots( {nPage:j} );
			for (var i = 0; i < annots.length; i++)

				// store the properties for the readonly annot then delete the annot. 
				if(annots[i].readOnly == true) 
				{
					myCopyAnnotsProps[num++] = annots[i].getProps();
					annots[i].readOnly == false;
					annots[i].destroy();
				}
		}

		// we only export editable annotations to file 
		if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0) 
		   trustedSaveAnnotsToFile(doc);  
		else 
		   saveAnnotsToFile(doc);	

		// after export, we restore the removed annot objects back. 
		for (var n in myCopyAnnotsProps) 
			doc.addAnnot(myCopyAnnotsProps[n]);
		
		// Ok, now update the display
		doc.delay = false;

	} catch (e) {
		console.println("error saving editable annots to file : " + e);
	}
}

/**
 * user method
 */
function retrieveAnnotsFromFile(doc)
{
	try { 
		// load data from FDF file
		doc.importAnFDF(ACROSDK.FDFFile);		 
	} catch (e) {
		console.println("error retrieving annots from file : " + e);
	}
}

/**
 * user method
 */
function changeAllAnnotsReadOnly(doc, b)
{
	try{ 
		// go through all annot objects and set the readonly property
		doc.syncAnnotScan();
		for (var j = 0; j < doc.numPages; j++) {
			var annots = doc.getAnnots( {nPage:j} );
			for (var i = 0; i < annots.length; i++)
				annots[i].readOnly = b;
		}
	} catch (e) {
		console.println("error changing all annots readOnly property : " + e);
	}
}


// trusted function wraper for version 7 
if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0) 
	trustedAnnotToolkit = app.trustedFunction(annotToolkit);


// function to launch the dialog 
function annotToolkit(dialog, doc)
{	
	dialog.doc = doc;
	if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0) 
		app.beginPriv();
	app.execDialog(dialog);
	if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0) 
		app.endPriv();
}

// dialog object
ACROSDK.myAnnotToolkitDialog =
{
	// initialize
	initialize: function(dialog)
	{
		dialog.load({ "afil": ACROSDK.FDFFile });
	},

	
	// function associated with button 1 to export all annots
	"btn1":function(dialog)
	{
		ACROSDK.FDFFile = dialog.store()["afil"];
		if (typeof app.formsVersion != 'undefined' && app.formsVersion >= 7.0) 
				trustedSaveAnnotsToFile(this.doc);  
		else saveAnnotsToFile(this.doc);
			
		dialog.end();
	},
	
	// function associated with button 2 to export editable annots
	"btn2":function(dialog)
	{
		ACROSDK.FDFFile = dialog.store()["afil"];
		saveEditableAnnotsToFile(this.doc);
		dialog.end();
	},
	
	// function associated with button 3 to import annots
	"btn3":function(dialog)
	{
		ACROSDK.FDFFile = dialog.store()["afil"];
		retrieveAnnotsFromFile(this.doc);
		dialog.end();
	},
	
	// function associated with button 4 to set all annots to be read only 
	"btn4":function(dialog)
	{
		changeAllAnnotsReadOnly(this.doc, true);
		dialog.end();
	},
	
	// function associated with button 5 to set all annots to be editable 
	"btn5":function(dialog)
	{
		changeAllAnnotsReadOnly(this.doc, false);
		dialog.end();
	},
	
	// Dialog Description
	description:
	{
		name: "Annotation Sample",
		elements:
		[
			{
				type: "view",
				align_children: "align_left",
				elements:
				[
					{
						type: "cluster",
						align_children: "align_fill",
						elements:
						[
							{
								type: "button",
								name: "Export All Annotations",
								item_id: "btn1"
							},
							{
								type: "button",
								name: "Export Editable Only",
								item_id: "btn2"
							},
							{
								type: "button",
								name: "Import Annotations",
								item_id: "btn3"
							},
							{
								type: "button",
								name: "Set Annots to Read-Only",
								item_id: "btn4"
							},
							{
								type: "button",
								name: "Set Annots to Editable",
								item_id: "btn5"
							}
						]
					},
					{
						type: "view",
						alignment: "align_fill",
						align_children: "align_left",
						elements:
						[
							{
								type: "static_text",
								item_id: "txt1",
								name: "Data File : ",
								font_id: 3
							},
							{
								type: "edit_text",
								item_id: "afil",
								alignment: "align_fill"
							}
						]
					},
					{
						type: "ok",
						name: "Close"
					}
				]
			}
		]
	}
};