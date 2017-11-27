# PublicationAdjudication (Name pending..)

Adobe Plugin to scrape AF E-Pubs Metadata 


### Workflow (Updated 27 Nov)
#### 1. User opens AFI / AF Form
#### 2. Button added to toolbar turns red indicating the currently open form has not been checked 
#### 3. User clicks button, javascript checks E-publishing.af.mil for latest form date
#### 4. Alert user on new version available, if there is one provide direct download link
#### 5. Button turns green (probably limited to next reopen of Adobe, if multiple docs are opend at same time not sure if we can "reset" it each time)

### Scope
#### 1. Only applies to AFNET boxes (Preloaded with Acobat Pro)
#### 2. Will not (initially) apply to all forms / pubs (i.e. DD forms)

### TODO List
- [-] Generate and embed proper icon stream data
- [ ] Cleanup embeded metadata to build proper search strings (i.e. AFFORM => AF)
- [ ] Build web response parser (REGEX)
- [ ] Build date comparision logic, user notifications
- [-] Provide direct download link to updated version (if exists) 
- [-] Update button color on sucessful check 
- [ ] Investiage if possible to programatically add button to "Quick Tools bar" for all users

### Starting reads: 
Adobe DC (& X, XI) SDK Documentation
> https://help.adobe.com/en_US/acrobat/acrobat_dc_sdk/2015/HTMLHelp/index.html#t=Acro12_MasterBook%2FIntroduction_Help_TitlePage%2FAbout_This_Help.htm&rhsyns=%20&rhsearch=net.http

Net.HTTP.Request documentation 
> http://help.adobe.com/en_US/acrobat/acrobat_dc_sdk/2015/HTMLHelp/#t=Acro12_MasterBook%2FJS_API_AcroJS%2FNet_HTTP_methods.htm


Note this script will act like a "plugin" due to running out of the main application folder
> https://acrobatusers.com/tutorials/folder_level_scripts
