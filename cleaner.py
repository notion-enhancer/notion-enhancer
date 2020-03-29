
# Notion Enhancer
# (c) 2020 dragonwocky <thedragonring.bod@gmail.com>
# (c) 2020 TarasokUA
# (https://dragonwocky.me/) under the MIT license

import os
import sys
import platform
import subprocess
from shutil import rmtree
from time import sleep

# f'{bold}=== title ==={normal}'    = headers
# '*'                               = information
# '...'                             = actions
# '###'                             = warnings
# '>'                               = exit

bold = '\033[1m'
normal = '\033[0m'

print(f'{bold}=== NOTION ENHANCER CLEANING LOG ==={normal}\n')
try:
    filepath = ''
    if 'microsoft' in platform.uname()[3].lower() and sys.platform == 'linux':
        filepath = '/mnt/c/' + \
            subprocess.run(
                ['cmd.exe', '/c', 'echo', '%localappdata%'], stdout=subprocess.PIPE).stdout \
            .rstrip().decode('utf-8')[3:].replace('\\', '/') + '/Programs/Notion/resources'
    elif sys.platform == 'win32':
        filepath = subprocess.run(['echo', '%localappdata%'], shell=True, capture_output=True).stdout \
            .rstrip().decode('utf-8').replace('\\', '/') + '/Programs/Notion/resources'
    else:
        print(' > script not compatible with your os!\n   (report this to dragonwocky#8449 on discord)')
        exit()

    if os.path.exists(filepath + '/app'):
        print(
            f' ...removing folder {filepath}/app/')
        rmtree(filepath + '/app')
    else:
        print(
            f' * {filepath}/app/ was not found: step skipped.')

    if os.path.isfile(filepath + '/app.asar.bak'):
        print(' ...renaming asar.app.bak to asar.app')
        os.rename(filepath + '/app.asar.bak', filepath + '/app.asar')
    else:
        print(
            f' * {filepath}/app.asar.bak was not found: step skipped.')

    print(f'\n{bold}>>> SUCCESSFULLY CLEANED <<<{normal}')

except Exception as e:
    print(f'\n{bold}### ERROR ###{normal}\n{str(e)}')

print(f'\n{bold}=== END OF LOG ==={normal}')
