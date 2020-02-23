"""
# Step 1
1.Locating notion app at ./%Username%/AppData/Local/Programs/Notion
2.Unpacking app.asar in new folder at./Notion/resources/app
3.Renaming file app.asar to app.asar.bak (because instead app won't use folder "app" to get all resources from it)
4.If app.asar already unpacked - it will try to locate folder "app" and skip to next step

# Step 2
1. Editing userscript file to replace "full_path_to_custom_style" with full path to ./custom_style.css
2. Adding userscript from main.user.js(should be in same folder with this .py file) to the ./app/renderer/preload.js
3. If there is already userscript - it will overwrite it.

# Step 3
1. Adding property "frame: false" to the place where application window is creating

# Step 4
1. Changes "window drag" area, to make window draggable
 1.1. You can change it by yourself, if you experiencing problems with dragging window or with clicking buttons on app topbar
      Because this "draggable area" is creating on top of the other stuff, so if it will have button behind it - it won't be clickable.
      You should change top,left,right properties. Now it's 2px on top, 390px on left and 420px on right;
"""
import os
from time import sleep
from shutil import copyfile
import re

try:
    sleepTime = 0.5
    sleep(sleepTime)
    print("========= START OF LOG =========")
    sleep(sleepTime)
    LOCALAPPDATA = os.getenv('LOCALAPPDATA')
    notionResourcesPath = LOCALAPPDATA + '/Programs/Notion/resources'
    windowToggleHotkey = "'ctrl+shift+a'"

    # Step 1
    print("Step 1")
    sleep(sleepTime)
    if os.path.isfile(notionResourcesPath + '/app.asar'):
        sleep(sleepTime)
        print(" Unpacking app.asar")
        os.system("asar extract %LOCALAPPDATA%/Programs/Notion/resources/app.asar %LOCALAPPDATA%/Programs/Notion/resources/app")
        sleep(sleepTime)
        renameSource = notionResourcesPath + '/app.asar'
        renameDestination = renameSource + '.bak'
        os.rename(renameSource, renameDestination)
        print("  Renaming asar.app to asar.app.bak")
        sleep(sleepTime)
    else:
        sleep(sleepTime)
        print(" There is no file at Notion/resources/app.asar")
        sleep(sleepTime)
        print("  Trying to locate unpacked app.asar")
        sleep(sleepTime)
        if os.path.exists(notionResourcesPath + '/app'):
            print("   app.asar already unpacked - Moving to the next step")
            sleep(sleepTime)
        else:
            print("   Nothing found at Notion/resources/app. Exiting. ")
            input("Press Enter to exit...")
            exit()
    print("-Done-\n")
    sleep(sleepTime)

    print("Step 2")
    sleep(sleepTime)
    # Step 2
    if os.path.isfile(notionResourcesPath + '/app/renderer/preload.js'):
        print(" Adding userscript to Notion/resources/app/renderer/preload.js")
        sleep(sleepTime)

        preload = open(notionResourcesPath + '/app/renderer/preload.js', 'rt')
        preloadStr = preload.read()
        preload.close()
        if 'function userscript()' in preloadStr:
            print("  Userscript already added. Replacing it")
            sleep(sleepTime)
            userscript_line = 0
            with open(notionResourcesPath + '/app/renderer/preload.js') as myFile:
                for num, line in enumerate(myFile, 1):
                    if "function userscript()" in line:
                        userscript_line = num-1

            preload = open(notionResourcesPath + '/app/renderer/preload.js', 'rt')
            preloadLines = preload.readlines()
            preload.close()

            with open(notionResourcesPath + '/app/renderer/preload.js', 'w') as fin:
                for lineno, line in enumerate(preloadLines, 1):
                    if lineno < userscript_line:
                        fin.write(line)

        print(" Creating link to ./resources/custom_style.css")
        sleep(sleepTime)
        preload = open(notionResourcesPath + '/app/renderer/preload.js', 'a')
        userscript = open('./resources/main.user.js')
        scriptPath = os.getcwd()
        scriptPath = scriptPath.replace('\\', '/')
        userscriptStr = userscript.read()
        userscriptStr = userscriptStr.replace('full_path_to_custom_style',scriptPath + '/resources/custom_style.css')
        preload.write('\n' + userscriptStr)
        preload.close()
    else:
        print(" There is no files at Notion/resources/app/renderer/preload.js or/and ./resources/main.user.js - Nothing was done")
        sleep(sleepTime)
    print("-Done-\n")
    sleep(sleepTime)

    print("Step 3")
    sleep(sleepTime)
    # Step 3
    if os.path.isfile(notionResourcesPath + '/app/main/createWindow.js'):
        print(" Making window frameless at Notion/resources/app/main/createWindow.js")
        sleep(sleepTime)

        createWindow = open(notionResourcesPath + '/app/main/createWindow.js', 'rt')
        createWindowText = createWindow.read()
        createWindowText = createWindowText.replace('{ show: false', '{ frame: false, show: false')

        print(" Adding ""Run Hidden"" functionality at Notion/resources/app/main/createWindow.js")
        sleep(sleepTime)
        createWindowText = createWindowText.replace('window.show();', """
            const path = require("path");
            const Store = require(path.join(__dirname,'../','store.js'));
            const store = new Store({
            configName: "user-preferences",
            defaults: {
               runHidden: false,
               alwaysMaximized: false
            }});

            var RunHiddenCheckboxState = store.get("runHidden");
            var AlwaysMaximizedCheckboxState = store.get("alwaysMaximized");

            if(RunHiddenCheckboxState) {
                //Do nothing
            } else {
                if(AlwaysMaximizedCheckboxState) {
                    window.maximize();
                } else {
                window.show() 
                }
            }""")
        createWindow.close()

        createWindow = open(notionResourcesPath + '/app/main/createWindow.js', 'wt')
        createWindow.write(createWindowText)
        createWindow.close()
    else:
        print(" There is no files at Notion/resources/app/main/createWindow.js - Nothing was done")
        sleep(sleepTime)
    print("-Done-\n")
    sleep(sleepTime)

    print("Step 4")
    sleep(sleepTime)
    # Step 4
    if os.path.isfile(notionResourcesPath + '/app/renderer/index.js'):
        print(" Adjusting drag area for frameless window in Notion/resources/app/renderer/index.js")
        sleep(sleepTime)
        createWindow = open(notionResourcesPath + '/app/renderer/index.js', 'rt')
        createWindowText = createWindow.read()
        topIndex = createWindowText.rfind("top")
        createWindowTextSplit = createWindowText[topIndex:]
        createWindowTextSplit = createWindowTextSplit.replace("right: 0", "right: 420 ")
        createWindowTextSplit = createWindowTextSplit.replace("top: 0", "top: 1 ")
        createWindowTextSplit = createWindowTextSplit.replace("height: 34", "height: 16")
        createWindowText = createWindowText[:topIndex] + createWindowTextSplit
        createWindow.close()

        createWindow = open(notionResourcesPath + '/app/renderer/index.js', 'wt')
        createWindow.write(createWindowText)
        createWindow.close()
    else:
        print(" There is no files at Notion/resources/app/renderer/index.js - Nothing was done")
        sleep(sleepTime)
    print("-Done-\n")
    sleep(sleepTime)

    print("Step 5")
    sleep(sleepTime)
    # Step 5
    if os.path.isfile(notionResourcesPath + '/app/main/main.js'):
        print(" Adding tray support at Notion/resources/app/main/main.js")
        sleep(sleepTime)
        print("  Adding context menu with settings to tray")
        sleep(sleepTime)

        hotkeysCodeText = """
    const {Tray, Menu} = require("electron");
    let tray = null;
    electron_1.app.on("ready", function() {
        handleReady();

        const path = require("path");
        const Store = require(path.join(__dirname,'../','store.js'));

        const store = new Store({
          configName: "user-preferences",
          defaults: {
            alwaysMaximized: false,
            CloseToTrayCheckbox: false,
            runHidden: false
          }
        });

        var RunAtStartupCheckboxState = electron_1.app.getLoginItemSettings().openAtLogin;
        var RunHiddenCheckboxState = store.get("runHidden");
        var AlwaysMaximizedCheckboxState = store.get("alwaysMaximized");
        var CloseToTrayCheckboxState = store.get("CloseToTrayCheckbox");

        tray = new Tray(path.join(__dirname,"./icon.ico"));
        const contextMenu = Menu.buildFromTemplate([
        {   
            id: "RunAtStartupCheckbox",
            label: "Run at Startup", 
            type:"checkbox", 
            checked: RunAtStartupCheckboxState,
            click() { 
                var isChecked = contextMenu.getMenuItemById("RunAtStartupCheckbox").checked;
                if(isChecked) {
                    electron_1.app.setLoginItemSettings({ openAtLogin: true});
                } else {
                    electron_1.app.setLoginItemSettings({ openAtLogin: false});
                }
            } 
        },
        {   
            id: "runHidden",
            label: "Run Hidden", 
            type:"checkbox", 
            checked: RunHiddenCheckboxState,
            click() { 
                var isChecked = contextMenu.getMenuItemById("runHidden").checked;
                if(isChecked) {
                    store.set("runHidden", true);
                } else {
                    store.set("runHidden", false);
                }
            } 
        },
        { 
            id: "AlwaysMaximizedCheckbox",
            label: "Open Maximized",
            type: "checkbox",
            checked: AlwaysMaximizedCheckboxState,
            click() {
                var isChecked = contextMenu.getMenuItemById("AlwaysMaximizedCheckbox").checked;
                if(isChecked) {
                    store.set("alwaysMaximized", true);
                } else {
                    store.set("alwaysMaximized", false);
                }
            }
        },
        { 
            id: "CloseToTrayCheckbox",
            label: "Close To Tray",
            type: "checkbox",
            checked: CloseToTrayCheckboxState,
            click() {
                var isChecked = contextMenu.getMenuItemById("CloseToTrayCheckbox").checked;
                if(isChecked) {
                    store.set("CloseToTrayCheckbox", true);
                } else {
                    store.set("CloseToTrayCheckbox", false);
                }
            }
        },
        { 
            type: "separator"
        },
        { 
            label: "Quit", 
            role: "quit"
        }
        ]);
        tray.setContextMenu(contextMenu);

        tray.on("click", function() {
            var win = electron_1.BrowserWindow.getAllWindows()[0];
            var alwaysMax = contextMenu.getMenuItemById("AlwaysMaximizedCheckbox").checked;
            if (win.isVisible()) {
                if(win.isMinimized()) {
                    win.show()
                } else {
                    win.hide();
                }
            } else {
                if(alwaysMax){
                    win.maximize();
                } else {
                    win.show();
                }
            }
        });

        var notionToggleHotkey = 'ctrl+shift+a';
        const globalShortcut =  electron_1.globalShortcut;
        globalShortcut.register(notionToggleHotkey, function() {
            var win = electron_1.BrowserWindow.getAllWindows()[0];
            var alwaysMax = contextMenu.getMenuItemById("AlwaysMaximizedCheckbox").checked;
            if (win.isVisible()) {
                win.hide();
            } else {
                if(alwaysMax){
                    win.maximize();
                } else {
                    win.show();
                }
            }
        });
    });
    """
        mainJs = open(notionResourcesPath + '/app/main/main.js', 'rt')
        mainJsText = mainJs.read()
        mainJs.close()

        print("   Adding hotkey to show/hide Notion window")
        sleep(sleepTime)
        if "var notionToggleHotkey" in mainJsText:
            mainJsText = re.sub(r"var notionToggleHotkey = '([A-Za-z0-9+_\./\\-]*)'", "var notionToggleHotkey = " + windowToggleHotkey, mainJsText)
        else :
            mainJsText = mainJsText.replace('electron_1.app.on("ready", handleReady);' , hotkeysCodeText)
            mainJsText = mainJsText.replace('win.focus()','win.show()',1)

        print(" Copying tray icon ""icon.ico"" to /app/main/ ")
        sleep(sleepTime)
        copyfile('./resources/icon.ico', notionResourcesPath + '/app/main/icon.ico' )

        print(" Copying settings saver class ""store.js"" to /app/ ")
        sleep(sleepTime)
        copyfile('./resources/store.js', notionResourcesPath + '/app/store.js' )

        mainJs = open(notionResourcesPath + '/app/main/main.js', 'wt')
        mainJs.write(mainJsText)
        mainJs.close()
        sleep(sleepTime)
    else:
        print(" There is no files at Notion/resources/app/main/main.js - Nothing was done")
        sleep(sleepTime)
    print("-Done-")
    sleep(sleepTime)

    sleep(0.5)
    print("========= END OF LOG =========")
    sleep(0.5)
    print("""
                                            
     ____   _  _____ ____ _   _ _____ ____  
    |  _ \ / \|_   _/ ___| | | | ____|  _ \ 
    | |_) / _ \ | || |   | |_| |  _| | | | |
    |  __/ ___ \| || |___|  _  | |___| |_| |
    |_| /_/   \_|_| \____|_| |_|_____|____/ 
                                            
    """)
    sleep(4)
except Exception as e:
    sleep(0.5)
    print("========= END OF LOG =========")
    sleep(0.5)
    print("""
        __________  ____  ____  ____ 
       / ____/ __ \/ __ \/ __ \/ __ \\
      / __/ / /_/ / /_/ / / / / /_/ /
     / /___/ _, _/ _, _/ /_/ / _, _/ 
    /_____/_/ |_/_/ |_|\____/_/ |_|  
                                     
    \n\n""" + str(e))
    os.system('pause')
