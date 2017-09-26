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

 sdkAddSignature.js

 - Folder level Acrobat JavaScript file.

*********************************************************************/

/*
 * sdkAddSignature.js
 * 
 * 
 * Folder Javascript Created by Acrobat SDK.
 * This JavaScript sample shows you can programmatically sign a PDF document using
 * your digital ID file. 
 * 
 * As a sample, this file has included all the digital signature information
 * except the path and password for the digital ID file to be used.
 * When you are ready to sign a PDF, click the newly added "Add My Signature" 
 * menu item under the Edit>Acrobat SDK JavaScript menu. 
 * 
 * After you input the platform independent path and 
 * the password through a dialog, the program will create a digital
 * signature field in the top-left corner, and sign it with your data. The path 
 * and password are valid in a Acrobat session, so you can continue to sign more 
 * documents in the session without the input dialogs.
 * If you change the code to specify the path and password for the digital ID 
 * file to be used in this file, then when you click the menu item, the program will 
 * go automatically to sign PDFs without UI. 
 * 
 * Using the function SetUserPassword() and function SetUserDigitalIDPath() in this 
 * folder JavaScript code, you can call the JavaScript to quietly sign a PDF from other 
 * JavaScript code, or from a plug-in or IAC VB or VC program through function 
 * ExecuteThisScript( ). The VB and C Sample code is attached in end of this file.
 * 
 * A digital signature file ( DrTest.pfx ) is provided with the sample for your test
 * To use it, put it in a folder, and specify the proper DIpath ( e.g. /C/DrTest.pfx ).
 * Its password is "testpassword". 
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
 * password to use the digital signature
 *
 * to test the sample without user input, specify:
 * ACROSDK.sigUserPwd = "testpassword";
 */
ACROSDK.sigUserPwd = "UNKNOWN";

/* 
 * path to the digital signature file
 *
 * to test the sample without user input, specify:
 * ACROSDK.sigDigitalIDPath = "/C/DrTest.pfx";
 */
ACROSDK.sigDigitalIDPath = "UNKNOWN";

// other variables the user can modify 
ACROSDK.sigHandlerName = "Adobe.PPKLite";
ACROSDK.sigFieldname = "sdkSignatureTest";
ACROSDK.sigReason = "I want to test my digital signature program.";
ACROSDK.sigLocation = "San Jose, CA";
ACROSDK.sigContactInfo = "sendme@testinc.com";

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

// Add a menu item for AddSignature
app.addMenuItem( { 
	cName: "ACROSDK:AddSignature", 
	cUser: "Add My Signature", 
	cParent: "ACROSDK:JSSubMenu", 
   cEnable: "event.rc = (event.target != null);",
   cExec: "AddSignature(event.target)"    
});


/**
 * main function
 */ 
function AddSignature(doc)
{
	// if ACROSDK.sigDigitalIDPath is not spcified, ask for user input
	if(ACROSDK.sigDigitalIDPath == "UNKNOWN"){
		var cResponse = app.response({
				cQuestion: "Input your digital ID path:",
				cTitle: "Digital Signature",
				cDefault: "/C/DrTest.pfx",
		});
		
		if ( cResponse == null) {
			app.alert("No input.");
			return;
		}
		else
			SetUserDigitalIDPath(cResponse);
	}
		
	// if ACROSDK.sigUserPwd is not spcified, ask for user input
	if(ACROSDK.sigUserPwd == "UNKNOWN"){
		var cResponse = app.response({
				cQuestion: "Input your password:",
				cTitle: "Digital Signature",
				cDefault:  "testpassword",
		});
		
		if ( cResponse == null) {
			app.alert("No input.");
			return
		}
		else
			SetUserPassword(cResponse);
	}

	// create a new signature field
	var signatureField = AddSignatureField(doc);

	// sign it
	if(signatureField)	Sign(signatureField, ACROSDK.sigHandlerName);
}



/**
 * create a signature field in the upper left conner with name of ACROSDK.sigFieldname
 */
function AddSignatureField(doc)
{
	var inch=72;
	var aRect = doc.getPageBox( {nPage: 0} );
	aRect[0] += 0.5*inch; // from upper left hand corner of page.
	aRect[2] = aRect[0]+2*inch; // Make it 2 inch wide
	aRect[1] -= 0.5*inch;
	aRect[3] = aRect[1] - 0.5*inch; // and 0.5 inch high

	var sigField = null;
	try {
		sigField = doc.addField(ACROSDK.sigFieldname, "signature", 0, aRect );
	} catch (e) {
		console.println("An error occurred: " + e);
	}

	return sigField;
}

/**
 * define the Sign function as a privileged function
 */ 
Sign = app.trustedFunction (
    function( sigField, DigSigHandlerName )
	{
	  try {
		 app.beginPriv();
		var myEngine = security.getHandler(DigSigHandlerName); 
		myEngine.login( ACROSDK.sigUserPwd, ACROSDK.sigDigitalIDPath); 
		sigField.signatureSign({oSig: myEngine, 
								bUI: false,
								oInfo: { password: ACROSDK.sigUserPwd, 
										reason: ACROSDK.sigReason,
										location: ACROSDK.sigLocation,
										contactInfo: ACROSDK.sigContactInfo}
								});
		app.endPriv
	  } catch (e) {
			console.println("An error occurred: " + e);
	  }
	}
);

/** 
 * set a correct password for using the signature, so you can quietly sign a doc.
 */
function SetUserPassword(pwd)
{
	ACROSDK.sigUserPwd = pwd;
}

/** 
 * set path to the digital signature file
 */
function SetUserDigitalIDPath(idPath)
{
	ACROSDK.sigDigitalIDPath = idPath;
}

/*********************************************************************
	VB code in an Acrobat IAC program
	to sign a PDF quietly ( no Acrobat running on screen ),
  using the JS methods in this file
 *********************************************************************
	' .........
	' At this point, a PDF file has been opened, but Acrobat may be hidden. 
		
    ' get acrobat form object
    Dim formApp As AFORMAUTLib.AFormApp
    Set formApp = CreateObject("AFormAut.App")
        
    ' access some object property in objects inside AcroForm.
    Dim fields As AFORMAUTLib.fields
    Set fields = formApp.fields
    
    ' One way to use a JavaScript code in VB is through fields' method ExecuteThisJavascript.
    'Dim nVersion As Integer
    'nVersion = fields.ExecuteThisJavascript("event.value = app.viewerVersion;")
    'MsgBox "The Acrobat Viewer Version is " & nVersion
    
    'Sign the document
    Dim menuItem As String
    Dim digitalIDPwd As String
    Dim digitalIDPath As String
    
    digitalIDPwd = "testpassword"
    digitalIDPath = "/C/DrTest.pfx"
    menuItem = "ADBESDK:AddSignature"
    
    Dim jsCode As String
    Dim jsRc As Boolean
    jsCode = "SetUserPassword(" + "'" + digitalIDPwd + "'); SetUserDigitalIDPath(" + "'" + digitalIDPath + "');" + "app.execMenuItem(" + "'" + menuItem + "');"
    
    ' Execute JS code to sign doc
    fields.ExecuteThisJavascript (jsCode)
    
    'save & close
    AVDoc.Close (True)


	' .........
*********************************************************************/    

/*********************************************************************
	C code in an Acrobat plug-in
	to sign a PDF quietly using the JS methods in this file
 *********************************************************************
ASBool MyCallJS(PDDoc pdDoc)
{
	if(!pdDoc) return false;

	char jsScript[512];
	char* pwd="testpassword";
	char* digitalIDPath = "/C/DrTest.pfx";
	char* menuItem = "ADBESDK:AddSignature";

	sprintf(jsScript, "SetUserPassword('%s'); SetUserDigitalIDPath('%s'); app.execMenuItem('%s');",
					pwd, digitalIDPath, menuItem); 	

	return AFExecuteThisScript (pdDoc, jsScript, NULL);
}

*********************************************************************/