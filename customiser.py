
# Notion Enhancer
# (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
# (c) 2020 TarasokUA
# (https://dragonwocky.me/) under the MIT license

import re
import os
import sys
import platform
import subprocess
from shutil import copyfile
from time import sleep

# for toggling notion visibility
hotkey = 'CmdOrCtrl+Shift+A'

# f'{bold}=== title ==={normal}'    = headers
# '*'                               = information
# '...'                             = actions
# '##'                              = warnings
# '>'                               = exit

bold = '\033[1m'
normal = '\033[0m'

print(f'{bold}=== NOTION ENHANCER CUSTOMISATION LOG ==={normal}\n')

try:
    filepath = ''
    __folder__ = os.path.dirname(os.path.abspath(__file__)).replace('\\', '/')
    if 'microsoft' in platform.uname()[3].lower() and sys.platform == 'linux':
        filepath = '/mnt/c/' + \
            subprocess.run(
                ['cmd.exe', '/c', 'echo', '%localappdata%'], stdout=subprocess.PIPE).stdout \
            .rstrip().decode('utf-8')[3:].replace('\\', '/') + '/Programs/Notion/resources'
        __folder__ = 'C:/' + __folder__[6:]
    elif sys.platform == 'win32':
        filepath = subprocess.run(['echo', '%localappdata%'], shell=True, capture_output=True).stdout \
            .rstrip().decode('utf-8').replace('\\', '/') + '/Programs/Notion/resources'
    else:
        print(' > script not compatible with your os!\n   (report this to dragonwocky#8449 on discord)')
        exit()

    if os.path.isfile(filepath + '/app.asar'):
        print(' ...unpacking app.asar')
        subprocess.run(['asar', 'extract', filepath +
                        '/app.asar', filepath + '/app'], shell=(True if sys.platform == 'win32' else False))
        print(' ...renaming asar.app to asar.app.bak')
        os.rename(filepath + '/app.asar', filepath + '/app.asar.bak')
    else:
        print(f' ## file {filepath}/app.asar not found!')
        print(' * attempting to locate')
        if os.path.exists(filepath + '/app'):
            print(' * app.asar was already unpacked: step skipped.')
        else:
            print(' > nothing found: exiting.')
            exit()

    if os.path.isfile(filepath + '/app/renderer/preload.js'):
        print(f' ...adding preload.js to {filepath}/app/renderer/preload.js')
        with open(filepath + '/app/renderer/preload.js') as content:
            if '/* === INJECTION MARKER === */' in content.read():
                print(' * preload.js already added. replacing it.')
                content.seek(0)
                original = []
                for num, line in enumerate(content):
                    if '/* === INJECTION MARKER === */' in line:
                        break
                    original += line
                with open(filepath + '/app/renderer/preload.js', 'w') as write:
                    write.writelines(original)
            else:
                with open(filepath + '/app/renderer/preload.js', 'a') as append:
                    append.write('\n\n')
        with open(filepath + '/app/renderer/preload.js', 'a') as append:
            print(' ...linking to ./resources/user.css')
            with open('./resources/preload.js') as insert:
                append.write(insert.read().replace(
                    '___user.css___',                    __folder__
                    + '/resources/user.css'))
    else:
        print(
            f' * {filepath}/app/renderer/preload.js was not found: step skipped.')

    if os.path.isfile(filepath + '/app/main/createWindow.js'):
        with open(filepath + '/app/main/createWindow.js') as content:
            content = content.read()
            print(
                f' ...making window frameless @ {filepath}/app/main/createWindow.js')
            if '{ frame: false, show: false' not in content:
                content = content.replace(
                    '{ show: false', '{ frame: false, show: false')
            print(
                f' ...adding "open hidden" capabilities to {filepath}/app/main/createWindow.js')
            content = re.sub('\\s*\\/\\* === INJECTION START === \\*\\/.*?\\/\\* === INJECTION END === \\*\\/\\s*',
                             'window.show()', content, flags=re.DOTALL).replace('window.show()', """
                /* === INJECTION START === */
                const path = require('path'),
                    store = new (require(path.join(__dirname, '..', 'store.js')))({
                    config: 'user-preferences',
                    defaults: {
                        openhidden: false,
                        maximised: false
                    }
                    });
                if (!store.get('openhidden') || electron_1.BrowserWindow.getAllWindows().some(win => win.isVisible()))
                    { window.show(); if (store.get('maximised')) window.maximize(); }
                /* === INJECTION END === */
            """)
            with open(filepath + '/app/main/createWindow.js', 'w') as write:
                write.write(content)
    else:
        print(
            f' * {filepath}/app/main/createWindow.js was not found: step skipped.')

    if os.path.isfile(filepath + '/app/renderer/index.js'):
        with open(filepath + '/app/renderer/index.js') as content:
            print(
                f' ...adjusting drag area for frameless window in {filepath}/app/renderer/index.js')
            content = content.read()
            top = content.rfind('top')
            content = content[:top] + content[top:].replace(
                'right: 0', 'right: 420').replace(
                'top: 0', 'top: 1 ').replace(
                'height: 34', 'height: 16')
            with open(filepath + '/app/renderer/index.js', 'w') as write:
                write.write(content)
    else:
        print(
            f' * {filepath}/app/renderer/index.js was not found: step skipped.')

    if os.path.isfile(filepath + '/app/main/main.js'):
        with open(filepath + '/app/main/main.js') as content:
            print(
                f' ...adding tray support (inc. context menu with settings) to {filepath}/app/main/main.js')
            print(
                f' ...adding window toggle hotkey to {filepath}/app/main/main.js')
            content = content.read()
            with open(filepath + '/app/main/main.js', 'w') as write:
                if '/* === INJECTION MARKER === */' in content:
                    print(' * hotkey.js already added. replacing it.')
                    original = []
                    for line in content.splitlines():
                        if '/* === INJECTION MARKER === */' in line:
                            break
                        original.append(line)
                    write.write('\n'.join(original))
                else:
                    write.write(content.replace(
                        'electron_1.app.on("ready", handleReady);',
                        'electron_1.app.on("ready", () => handleReady() && enhancements());') + '\n')
        with open(filepath + '/app/main/main.js', 'a') as append:
            with open('./resources/hotkey.js') as insert:
                append.write('\n' + insert.read().replace(
                    '___hotkey___', hotkey))
        print(
            f' ...copying tray icon ./resources/notion.ico to {filepath}/app/main/')
        copyfile('./resources/notion.ico',
                 filepath + '/app/main/notion.ico')
        print(
            f' ...copying datastore wrapper ./resources/store.js to {filepath}/app/')
        copyfile('./resources/store.js', filepath + '/app/store.js')
    else:
        print(
            f' * {filepath}/app/main/main.js was not found: step skipped.')

    print(f'\n{bold}>>> SUCCESSFULLY CUSTOMISED <<<{normal}')

except Exception as e:
    print(f'\n{bold}### ERROR ###{normal}\n{str(e)}')

print(f'\n{bold}=== END OF LOG ==={normal}')
