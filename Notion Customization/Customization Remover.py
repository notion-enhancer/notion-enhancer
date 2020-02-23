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
from shutil import rmtree
import re

try:
    sleepTime = 0.5
    sleep(sleepTime)
    print("========= START OF LOG =========")
    sleep(sleepTime)
    LOCALAPPDATA = os.getenv('LOCALAPPDATA')
    LOCALAPPDATA = LOCALAPPDATA.replace('\\', '/')
    notionResourcesPath = LOCALAPPDATA + '/Programs/Notion/resources'

    if os.path.exists(notionResourcesPath + '/app'):
        rmtree(notionResourcesPath + '/app')
        print("Removing ""app"" folder")
        sleep(sleepTime)
    else:
        print("There is no ""app"" folder at ./Notion/resources/app - Skipping this step")
        sleep(sleepTime)

    if os.path.isfile(notionResourcesPath + '/app.asar.bak'):
        renameSource = notionResourcesPath + '/app.asar.bak'
        renameDestination = notionResourcesPath + '/app.asar'
        os.rename(renameSource, renameDestination)
        print("Renaming app.asar.bak to app.asar")
        sleep(sleepTime)
    else:
        print("There is no ""app.asar.bak"" at ./Notion/resources/app.asar.bak - Skipping this step")
        sleep(sleepTime)

    sleep(0.5)
    print("========= LOG =========")
    sleep(0.5)
    print("""
	                                             
	 ____  _____ __  __  _____     _______ ____  
	|  _ \| ____|  \/  |/ _ \ \   / | ____|  _ \ 
	| |_) |  _| | |\/| | | | \ \ / /|  _| | | | |
	|  _ <| |___| |  | | |_| |\ V / | |___| |_| |
	|_| \_|_____|_|  |_|\___/  \_/  |_____|____/ 
	                                             
	""")
    sleep(2)
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
