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

 AnnotatedWords.js

 - Folder-level Acrobat JavaScript file.

*********************************************************************/

/* 
 * AnnotatedWords.js
 * 
 * This JavaScript adds a menu item under Edit>Acrobat SDK JavaScript menu:
 * Copy Annotated Words. 
 * 
 * This script returns to the console the words covered by highlight 
 * annotations. The script can be adapted to output the text elsewhere,
 * such as to a file. It can also be edited to include other text-related 
 * annotations, such as underline or cross-out.
 * 
 * Annotations are processed one page at a time. Each page's words
 * are stored in the ACROSDK.pageWords array of Word objects. 
 * This is a brute force method; other storage solutions 
 * might be considered.
 * 
 * This script is limited to single-column, left-to-right, top-to-bottom, 
 * horizontal, non-overlapping text. 
 * Vertical text, text bound to a shape, right-to-left text, etc., 
 * will require special handling or may not work at all.
 * 
 * Note that text is recovered annotation by annotation in the order 
 * that the annotations were applied to the doc, not in reading order
 * or any other word order on the page. 
 * 
 * Text returned may not always match exactly the text covered by the highlight.
 * This is mainly dependent upon two things: 1) whether a word is adjacent to 
 * punctuation or not, and 2) whether whole words or partial wordsare highlighted 
 * or not.
 * When a word is followed by a space, getPageNthWordQuads()returns the quads of 
 * only the word's characters, but if the word is adjacent to punctuation,
 * then the quads returned include the punctuation. Thus, an annotation that 
 * includes a word and a space will never have quads that exactly match those 
 * returned by getPageNthWordQuads. This script manages this by providing 
 * a ACROSDK.vertMargin variable to set a range within which a match 
 * might be obtained.  
 * Additionally, depending on line spacing, the vertical boundaries of a annotation
 * may not exactly match those of the word. The ACROSDK.horizMargin variable sets
 * the range within a match is considered.
 */

/*
 * Use of an object to emulate a unique namespace.
 *
 * Object literals act like global variables
 * defined within this particular namespace.
 */
if (typeof ACROSDK == "undefined")
	var ACROSDK = {};
	
// array to store page's words and their quads
ACROSDK.pageWords = []; 

/* 
 * margin in user space units to consider a match for 
 * vertical alignment of words and annotations
 *
 * practice has shown this is pretty close
 * except when highlights are multi-line
 *
 * this can be hard-coded or vary with font size and
 * line spacing of document. 
 */
ACROSDK.vertMargin = .1;

/*
 * margin in user space units to consider a match for
 * start or end of word and annotation
 *
 * practice has shown horizontal can vary more widely, 
 * especially near punctuation and with larger font sizes
 */
ACROSDK.horizMargin = 1;  

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

app.addMenuItem( {
   cName:"ACROSDK:CopyAnnotatedWords", 
   cUser:"Copy Annotated Words",
	cParent: "ACROSDK:JSSubMenu", 
	cExec: "annotatedWordsMain();", 
	// active only with docs open
	cEnable: "event.rc = (event.target != null);"
});
		
/**
 * function to define a Word object
 */
function Word(text, wordQuads, quadSets)
{
   this.text = text;
   this.wordQuads = wordQuads;
   this.quadSets = quadSets;
}

/**
 * function to store a documents words
 * as you get them, called for each page
 */
function storePageWords(thisDoc,thisPage)
{
   ACROSDK.pageWords = [];
   
   for (var wd = 0; wd < thisDoc.getPageNumWords(thisPage); wd++)
   {
      ACROSDK.pageWords[wd] = new Word(thisDoc.getPageNthWord(thisPage,wd), thisDoc.getPageNthWordQuads(thisPage,wd), thisDoc.getPageNthWordQuads(thisPage,wd).length);
   }
}

/**
 * function to return words overlapping with annotation Quads
 *
 * In all cases this function searches from 1st word to last word.
 * An update might be considered which sorts the words in some way
 * and performs a more efficient search based on that sort.
 */
function wordsFromQuads(annotPage, annotQuads)
{
   // return value
   var highlightedWords = ""; 
   
   // annotation's boundaries
   var left, right, top, bottom; 
    
   /* 
    * review equivalent array entries to the above "sides" since not 
    * assigning to vars. We use the wordQuads property instead.
    *
    * wordLeft = ACROSDK.pageWords[i].wordQuads[0][0] = ACROSDK.pageWords[i].wordQuads[0][4]
    * wordBottom = ACROSDK.pageWords[i].wordQuads[0][1] = ACROSDK.pageWords[i].wordQuads[0][3]
    * wordRight = ACROSDK.pageWords[i].wordQuads[0][2] = ACROSDK.pageWords[i].wordQuads[0][6]
    * wordTop = ACROSDK.pageWords[i].wordQuads[0][5] = ACROSDK.pageWords[i].wordQuads[0][7]
    */
   
   // index for page's words, start at 1st word
   var iWord = 0; 
   
   /*
    * the following variable assignments assume a rectangular quad over 
    * horizontal text. That is, (annotQuads[0]==annotQuads[4])= left,
    * annotQuads[1] == annotQuads[3] = bottom, etc. 
    * note that array value of quads property consists of points 
    * in this order: [X1 Y1 X2 Y2 X4 Y4 X3 Y3]
    *
    * See PDF Reference "Quadpoints Specification" for more information.
    */
   left = annotQuads[0];
   bottom = annotQuads[1];
   right = annotQuads[2];
   top = annotQuads[5];
   
   /*
    * This assumes left-to-right, top-to-bottom flow of text on page
    *
    * Iterate through words until find a word on same line as annot or run out of words
    * (search vertically for 1st word whose bottom is at or below annotation's bottom)
    *
    * upon exit you have 1st word on same line as current annotation    
    */
   while ( iWord < ACROSDK.pageWords.length-1) 
   { 
      if ( !((ACROSDK.pageWords[iWord].wordQuads[0][1] > top) && (ACROSDK.pageWords[iWord].wordQuads[0][1] < (bottom + ACROSDK.vertMargin))) )
         iWord++; 
      else
         break;
   }

   /*   
    * Find first word on this line that overlaps with annot
    * while on same line and have not run out of words (due to highlight over space or punctuation only)
    * while words are to left of annot (left edge of word and right edge of word < left
    *
    * upon exit you have first word that overlaps annotation    
    */
   while ((ACROSDK.pageWords[iWord].wordQuads[0][0] < left) && (ACROSDK.pageWords[iWord].wordQuads[0][2] < left) && (iWord < ACROSDK.pageWords.length-1) && (Math.abs(bottom - ACROSDK.pageWords[iWord].wordQuads[0][1])< ACROSDK.vertMargin))
   {  iWord++; }

   /*   
    * if the 1st word does not start after the annotation (no words under annot), 
    * then add it to highlighted words and continue adding words 
    */
   if ((ACROSDK.pageWords[iWord].wordQuads[0][0] <= (left + ACROSDK.horizMargin)) && (Math.abs(bottom - ACROSDK.pageWords[iWord].wordQuads[0][1])< ACROSDK.vertMargin) && (iWord < ACROSDK.pageWords.length-1)) 
   {
      highlightedWords = ACROSDK.pageWords[iWord].text + " ";
      iWord++;
   }
 
   /*
    * while annotation and words overlap horizontally, add more words
    * continue to check that not out of words and on same line
    */
   while (((ACROSDK.pageWords[iWord].wordQuads[0][0] < right) || (ACROSDK.pageWords[iWord].wordQuads[0][2] <= right)) && (Math.abs(bottom - ACROSDK.pageWords[iWord].wordQuads[0][1])< ACROSDK.vertMargin) && (iWord < ACROSDK.pageWords.length-1) ) 
   { 
      highlightedWords += ACROSDK.pageWords[iWord].text + " ";
      iWord++;
   }
   
   return highlightedWords;
} 

/*
 * main function
 * 
 * called by menu item
 */
function annotatedWordsMain() 
{

   var myAnnots = new Array();
   var numQuadArrays;
   var quadArray = new Array();
   
   // grab Doc object to pass to functions
   var myDoc = event.target; 
   
   console.println("-----------------------------");
   console.println("Acrobat SDK Annotated Words");
   console.println("Document: " +this.info.Title);
   
   // get document's annotations
   this.syncAnnotScan();
   
   for (var pg = 0; pg < this.numPages; pg++) 
   {
      // get the annots on the page
      myAnnots = this.getAnnots({nPage: pg}); 
      
      if(myAnnots != null) 
      {
         // store words and quads
         storePageWords(myDoc,pg);
      
         // print heading
         console.println(" -- Page " + (pg+1) + " -- ");
      
         // for each annot
         for (var i=0; i<myAnnots.length; i++)   
         {
            /*
             * if it's a highlight
             * can also expand this to include Underline, StrikeOut, etc.
             */
            if (myAnnots[i].type == "Highlight")
            {
               /*
                * Each set of quads is handled as a separate annotation when retrieving
                * words. This code could be improved when many multi-line annotations are
                * expected so that words are not searched from beginning of page each time.
                */
               for(var j=0; j<myAnnots[i].quads.length; j++) 
               {					
                  var results = wordsFromQuads(pg, myAnnots[i].quads[j]);
                  if (results != "") 
                  { 
                     // check to not print blank lines
                     console.println(results);
                  }
               }
            }
         }
      }
   }
   console.show(); //open console to show results
}

