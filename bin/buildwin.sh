#!/usr/bin/env bash
cd `dirname $0`/..

if rm -rf kachel-win32-x64; then
    
    if node_modules/.bin/konrad; then

        node_modules/.bin/electron-rebuild
    
        node_modules/electron-packager/cli.js . --overwrite --icon=img/app.ico
        
        rm -rf kachel-win32-x64/resources/app/inno
    fi
fi