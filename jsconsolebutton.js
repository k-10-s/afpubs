//Menu item ref: https://help.adobe.com/livedocs/acrobat_sdk/9.1/Acrobat9_1_HTMLHelp/wwhelp/wwhimpl/common/html/wwhelp.htm?context=Acrobat9_HTMLHelp&file=JS_API_AcroJS.88.134.html
app.addMenuItem({ cName: "JS Console", cParent: "File",
		cExec: "console.show()",
		cEnable: "event.rc = (event.target != null);",
		nPos: 0
	});

//ToolButton ref: https://help.adobe.com/livedocs/acrobat_sdk/9.1/Acrobat9_1_HTMLHelp/wwhelp/wwhimpl/common/html/wwhelp.htm?context=Acrobat9_HTMLHelp&file=JS_API_AcroJS.88.134.html
app.addToolButton({
		cName: "showJSConsole",
		//oIcon: oIcon,
		cExec: "console.show()",
		cTooltext: "Open JS Console",
		cMarked: false,
		cEnable: true,
		nPos: 0
	});