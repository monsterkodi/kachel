#!/usr/bin/env bash

DIR=`dirname $0`
BIN=$DIR/../node_modules/.bin

$BIN/wxw hook input &
$BIN/wxw hook info &
$BIN/wxw hook proc &
$BIN/wxw hook cmd &
