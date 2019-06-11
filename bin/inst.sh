#!/usr/bin/env bash
cd `dirname $0`/..

rm -rf /Applications/kachel.app
cp -R kachel-darwin-x64/kachel.app /Applications

open /Applications/kachel.app 
