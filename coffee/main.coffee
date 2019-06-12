###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, prefs, slash, app } = require 'kxk'

electron = require 'electron'
BrowserWindow = electron.BrowserWindow

kachelSize = 150
mainWin = null

winEvents = (win) ->
    win.on 'closed', kachelClosed
    win.on 'move',   saveBounds
    win.on 'focus',  onWinFocus
    win.on 'blur',   onWinBlur
    win.setHasShadow false
    
shortcut = slash.win() and 'ctrl+alt+k' or 'command+alt+k'
    
new app
    dir:            __dirname
    pkg:            require '../package.json'
    shortcut:       shortcut
    index:          'index.html'
    icon:           '../img/app.ico'
    tray:           '../img/menu.png'
    about:          '../img/about.png'
    minWidth:       50
    minHeight:      50
    maxWidth:       50
    maxHeight:      50
    width:          50
    height:         50
    resizable:      true
    maximizable:    false
    onWinReady:     (win) ->
        mainWin = win
        winEvents win

# 000   000   0000000    0000000  000   000  00000000  000      
# 000  000   000   000  000       000   000  000       000      
# 0000000    000000000  000       000000000  0000000   000      
# 000  000   000   000  000       000   000  000       000      
# 000   000  000   000   0000000  000   000  00000000  0000000  

onNewKachel = ->

    win = new electron.BrowserWindow
        
        movable:         true
        transparent:     true
        autoHideMenuBar: true
        frame:           false
        resizable:       false
        maximizable:     false
        minimizable:     false
        fullscreen:      false
        show:            false
        transparent:     false
        fullscreenenable: false
        backgroundColor: '#181818'
        width:           kachelSize
        height:          kachelSize
        minWidth:        kachelSize
        minHeight:       kachelSize
        maxWidth:        kachelSize
        maxHeight:       kachelSize
        webPreferences:
            nodeIntegration: true

    win.loadURL "file://#{__dirname}/../js/kachel.html"
    win.on 'ready-to-show', -> win.show()
    winEvents win
    win
        
post.on 'newKachel', onNewKachel

raised = false
raising = false

raise = (win) ->
    win.showInactive()
    win.focus()
    
hide = (win) ->
    win.hide()

onWinBlur = (event) -> 
    if event.sender == mainWin 
        raised = false

onWinFocus = (event) -> 
    if event.sender == mainWin
        if not raised and not raising
            onRaiseKacheln()
        else if raising
            raised = true
            raising = false
    
onHideKacheln = ->
    for win in kacheln()
        hide win
    raised = false

onRaiseKacheln = ->
    if raised
        onHideKacheln()
        return
    raising = true
    for win in kacheln()
        raise win
    raised = true
    raise mainWin

post.on 'raiseKacheln', onRaiseKacheln        
        
kachelClosed = (event) -> # log 'kachelClosed'
saveBounds   = (event) -> prefs.save() # log 'saveBounds', event.sender.id
    
wins        = -> BrowserWindow.getAllWindows().sort (a,b) -> a.id - b.id
activeWin   = -> BrowserWindow.getFocusedWindow()
kacheln     = -> wins().filter (w) -> w != mainWin
    