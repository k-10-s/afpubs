# afpubs

Adobe Plugin to scrape AF E-Pubs Metadata 


### Workflow
#### 1. User opens AFI / AF Form
#### 2. Acobat Reader Plugin or javascript checks E-publishing.af.mil for latest form date
#### 3. Alert user on new version available (and potentially provide direct download link)

### Scope
#### 1. Only applies to AFNET boxes (Preloaded with Acobat Pro)
#### 2. Will not (initially) apply to all forms / pubs (i.e. DD forms)


### Starting reads: 

Note this script will act like a "plugin" due to running out of the main application folder
> https://acrobatusers.com/tutorials/folder_level_scripts

How we'll get the data from e-pubs
> http://wwwimages.adobe.com/www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/js_api_reference.pdf Page 548

Net.HTTP requires higher priv...
> https://acrobatusers.com/tutorials/using_trusted_functions

Your GET request will look something like... 
> http://www.e-publishing.af.mil/#/?view=search&keyword=*********&isObsolete=false&modID=449&tabID=71

Extracting metadata from the form:
> https://forums.adobe.com/thread/2145701 (note "this.metadata" call only seems to work on "new" documents that say (SECURED) when opened as they contain the XMP metadata this is looking for)

Otherwise we *should* be able to view metadata via this.info.*

```javascript
this.info.Title
this.info.Author
this.info.Subject
```

 -or-

```javascript
for (var i in this.info)  
     console.println(i + ": "+ this.info[i]);
```
.
