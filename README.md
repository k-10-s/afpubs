### LIVE DEMO: https://youtu.be/w6t4MUzGiCw

# Installation 

### 1. Place epubsmain.js in 

`C:\Program Files (x86)\Adobe\Acrobat 2015\Acrobat\Javascripts`

### 2. Add the buttons to the quick toolbar. There are two ways


#### [MUCH PREFERRED]: 
Add the registry keys below to automatically add the button toolbar. (a .reg file is provided as example) 
(this could also be done via GPO or other deployment method..)

`[HKEY_CURRENT_USER\Software\Adobe\Adobe Acrobat\2015\AVGeneral\cFavoritesCommandsDesktop]`

`"a6"="_legacy:epubsred"`

`"a7"="_legacy:epubsgreen"`

#### [MANUAL]: 
Every single user would have to do this, which is unlikely to happen and will defeat the purpose

1. Right click on the menu bar, and select "Customize Quick Tools"
2. Find the "Add On Tools" menu, drop down and locate the E-Pubs buttons
3. Add E-Pubs buttons to quick tools.


# How it Works
##### 1. User opens AFI / AF Form
##### 2. Button added to toolbar turns red indicating the currently open form has not been checked 
##### 3. User clicks button, javascript checks E-publishing.af.mil for latest form date
##### 4. Alert user on new version available, if there is one provide direct download link
##### 5. Button turns green


