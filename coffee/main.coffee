###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, prefs, slash, clamp, klog, app } = require 'kxk'

Bounds   = require './bounds'
electron = require 'electron'
BrowserWindow = electron.BrowserWindow

kachelSizes = [72,108,144,216]
kachelSize  = 1
mainWin = null

winEvents = (win) ->
    win.on 'focus'  onWinFocus
    win.on 'blur'   onWinBlur
    win.setHasShadow false
    
shortcut = slash.win() and 'ctrl+alt+k' or 'command+alt+k'

KachelApp = new app
    dir:                __dirname
    pkg:                require '../package.json'
    shortcut:           shortcut
    index:              'mainwin.html'
    icon:               '../img/app.ico'
    tray:               '../img/menu.png'
    about:              '../img/about.png'
    minWidth:           50
    minHeight:          50
    maxWidth:           50
    maxHeight:          50
    width:              50
    height:             50
    acceptFirstMouse:   true
    resizable:          false #true
    maximizable:        false
    saveBounds:         false
    onWinReady:     (win) ->
        mainWin = win
        winEvents win
        loadKacheln()

loadKacheln = ->
    
    for kachelId,kachelData of prefs.get 'kacheln' {}
        if kachelId != 'appl'
            onNewKachel kachelData

# 000   000   0000000    0000000  000   000  00000000  000      
# 000  000   000   000  000       000   000  000       000      
# 0000000    000000000  000       000000000  0000000   000      
# 000  000   000   000  000       000   000  000       000      
# 000   000  000   000   0000000  000   000  00000000  0000000  

onNewKachel = (html:'default', data:) ->

    win = new electron.BrowserWindow
        
        movable:            true
        transparent:        true
        autoHideMenuBar:    true
        acceptFirstMouse:   true
        hasShadow:          false
        frame:              false
        resizable:          false
        maximizable:        false
        minimizable:        false
        fullscreen:         false
        show:               false
        transparent:        false
        fullscreenenable:   false
        backgroundColor:    '#181818'
        width:              kachelSizes[kachelSize]
        height:             kachelSizes[kachelSize]
        webPreferences:   
            nodeIntegration: true
    
    win.loadURL "file://#{__dirname}/../js/#{html}.html"
    
    win.webContents.on 'dom-ready' (event) ->
        post.toWin win.id, 'initData' data if data?
        win.show()
        
    winEvents win
    win
        
post.on 'newKachel' onNewKachel

#  0000000   00000000   00000000    0000000   000   000   0000000   00000000  
# 000   000  000   000  000   000  000   000  0000  000  000        000       
# 000000000  0000000    0000000    000000000  000 0 000  000  0000  0000000   
# 000   000  000   000  000   000  000   000  000  0000  000   000  000       
# 000   000  000   000  000   000  000   000  000   000   0000000   00000000  

onArrange = -> Bounds.arrange kacheln()
    
post.on 'arrange' onArrange

post.on 'snapKachel' (wid) -> Bounds.snap kacheln(), winWithId wid

#  0000000  000  0000000  00000000  
# 000       000     000   000       
# 0000000   000    000    0000000   
#      000  000   000     000       
# 0000000   000  0000000  00000000  

onKachelSize = (action, wid) ->
    
    if wid
        size = 0
        while kachelSizes[size] < winWithId(wid).getBounds().width
            size++
    else
        size = kachelSize
    
    switch action
        when 'increase' then size += 1
        when 'decrease' then size -= 1
        when 'reset'    then size  = 1
   
    size = clamp 0 kachelSizes.length-1 size
        
    if wid
        k = [winWithId wid]
    else
        k = kacheln()
        kachelSize = size
    
    for w in k
        b = w.getBounds()
        b.width  = kachelSizes[size]
        b.height = kachelSizes[size]
        w.setBounds b
        
    onArrange()

post.on 'kachelSize' onKachelSize

# 00000000    0000000   000   0000000  00000000
# 000   000  000   000  000  000       000     
# 0000000    000000000  000  0000000   0000000 
# 000   000  000   000  000       000  000     
# 000   000  000   000  000  0000000   00000000

raised  = false
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

post.on 'raiseKacheln' onRaiseKacheln        

post.on 'quit' KachelApp.quitApp

# 00000000   0000000    0000000  000   000   0000000  
# 000       000   000  000       000   000  000       
# 000000    000   000  000       000   000  0000000   
# 000       000   000  000       000   000       000  
# 000        0000000    0000000   0000000   0000000   

onFocusKachel = (winId, direction) ->
    switch direction
        when 'left''up'    then raise relWin winId, -1
        when 'right''down' then raise relWin winId,  1

post.on 'focusKachel' onFocusKachel
        
# kachelClosed = (event) -> # log 'kachelClosed'
    
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   

wins      = -> BrowserWindow.getAllWindows().sort (a,b) -> a.id - b.id
activeWin = -> BrowserWindow.getFocusedWindow()
kacheln   = -> wins().filter (w) -> w != mainWin
winWithId = (id) -> BrowserWindow.fromId id
    
relWin = (winId, delta) ->
    wl = wins()
    w = BrowserWindow.fromId winId
    wi = wl.indexOf w
    wl[(wl.length+wi+delta)%wl.length]
