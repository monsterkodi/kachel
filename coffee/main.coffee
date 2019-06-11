###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, prefs, app } = require 'kxk'

electron = require 'electron'

kachelSize = 150

winEvents = (win) ->
    win.on 'closed', kachelClosed
    win.on 'move',   saveBounds
    win.setHasShadow false
    
new app
    dir:            __dirname
    pkg:            require '../package.json'
    shortcut:       'Alt+K'
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
    onWinReady:     winEvents

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
    
kachelClosed = (event) -> # log 'kachelClosed'
saveBounds   = (event) -> prefs.save() # log 'saveBounds', event.sender.id
    
    