# afpubs
Adobe Plugin to scrape AF E-Pubs Metadata 





Good reads: 

http://wwwimages.adobe.com/www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/js_api_reference.pdf
Page 548

Note this script will act like a "plugin" due to running out of the main application folder

https://acrobatusers.com/tutorials/folder_level_scripts

https://acrobatusers.com/tutorials/using_trusted_functions

Extracting metadata example:
https://forums.adobe.com/thread/2145701 (note "this.metadata" call only seems to work on "new" documents that say (SECURED) when opened as they contain the XMP metadata this is looking for)

Otherwise we *should* be able to view metadata via this.info.*
this.info.Title
this.info.Author
this.info.Subject

-or-

for (var i in this.info)  
     console.println(i + ": "+ this.info[i]);
     
.
