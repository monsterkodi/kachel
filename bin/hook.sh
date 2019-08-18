#!/usr/bin/env bash

DIR=`dirname $0`
MC=$DIR/../node_modules/wxw/bin/mc.app/Contents/MacOS/mc

$MC hook input &
$MC hook info &
$MC hook proc &
$MC hook cmd &
