# afpubs

Adobe Plugin to scrape AF E-Pubs Metadata 


### Workflow (Updated 5 Nov)
#### 1. User opens AFI / AF Form
#### 2. Button added to toolbar turns red indicating the currently open form has not been checked 
#### 3. User clicks button, javascript checks E-publishing.af.mil for latest form date
#### 4. Alert user on new version available, if there is one (and potentially provide direct download link)
#### 5. Button turns green (probably limited to next reopen of Adobe, if multiple docs are opend at same time not sure if we can "reset" it each time)

### Scope
#### 1. Only applies to AFNET boxes (Preloaded with Acobat Pro)
#### 2. Will not (initially) apply to all forms / pubs (i.e. DD forms)


### Starting reads: 

Note this script will act like a "plugin" due to running out of the main application folder
> https://acrobatusers.com/tutorials/folder_level_scripts

How we'll get the data from e-pubs
> http://help.adobe.com/en_US/acrobat/acrobat_dc_sdk/2015/HTMLHelp/#t=Acro12_MasterBook%2FJS_API_AcroJS%2FNet_HTTP_methods.htm

Net.HTTP requires higher priv...
> https://acrobatusers.com/tutorials/using_trusted_functions

Your GET request will look something like... 
> http://www.e-publishing.af.mil/#/?view=search&keyword=*********&isObsolete=false&modID=449&tabID=71

Extracting metadata from the form:
> https://forums.adobe.com/thread/2145701 (note all metadata is only available once the user clicks "enable all features", which may or may not appear depending on the doc source)

We can also pull metadata via:

```javascript
this.info.Title
this.info.Author
this.info.Subject
this.info.creationdate
```

 -or-

```javascript
for (var i in this.info)  
     console.println(i + ": "+ this.info[i]);
```
.
