###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, prefs, slash, clamp, empty, klog, app } = require 'kxk'

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
    onWinReady: (win) ->
        
        mainWin = win
        winEvents win
        
        for kachelId,kachelData of prefs.get 'kacheln' {}
            if kachelId not in ['appl' 'folder']
                post.emit 'newKachel' kachelData

# 000   000   0000000    0000000  000   000  00000000  000      
# 000  000   000   000  000       000   000  000       000      
# 0000000    000000000  000       000000000  0000000   000      
# 000  000   000   000  000       000   000  000       000      
# 000   000  000   000   0000000  000   000  00000000  0000000  

post.on 'newKachel' (html:'default', data:) ->

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
        
#  0000000   00000000   00000000    0000000   000   000   0000000   00000000  
# 000   000  000   000  000   000  000   000  0000  000  000        000       
# 000000000  0000000    0000000    000000000  000 0 000  000  0000  0000000   
# 000   000  000   000  000   000  000   000  000  0000  000   000  000       
# 000   000  000   000  000   000  000   000  000   000   0000000   00000000  

post.on 'arrange' -> Bounds.arrange kacheln()

post.on 'snapKachel' (wid) -> Bounds.snap kacheln(), winWithId wid

#  0000000  000  0000000  00000000  
# 000       000     000   000       
# 0000000   000    000    0000000   
#      000  000   000     000       
# 0000000   000  0000000  00000000  

post.on 'kachelSize' (action, wid) ->
    
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
        Bounds.snap kacheln(), w
        
# 00000000    0000000   000   0000000  00000000
# 000   000  000   000  000  000       000     
# 0000000    000000000  000  0000000   0000000 
# 000   000  000   000  000       000  000     
# 000   000  000   000  000  0000000   00000000

raised  = false
raising = false
        
post.on 'raiseKacheln' ->
    
    if raised
        for win in kacheln()
            win.hide()
        raised = false
        return
    raising = true
    for win in kacheln()
        raiseWin win
    raised = true
    raiseWin mainWin
    
raiseWin = (win) ->
    win.showInactive()
    win.focus()

post.on 'quit' KachelApp.quitApp

# 00000000   0000000    0000000  000   000   0000000  
# 000       000   000  000       000   000  000       
# 000000    000   000  000       000   000  0000000   
# 000       000   000  000       000   000       000  
# 000        0000000    0000000   0000000   0000000   

post.on 'focusKachel' (winId, direction) ->
    raiseWin neighborWin winId, direction
     
onWinBlur = (event) -> 
    if event.sender == mainWin 
        raised = false

onWinFocus = (event) -> 
    if event.sender == mainWin
        if not raised and not raising
            post.emit 'raiseKacheln'
        else if raising
            raised = true
            raising = false
        
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   

wins      = -> BrowserWindow.getAllWindows().sort (a,b) -> a.id - b.id
activeWin = -> BrowserWindow.getFocusedWindow()
kacheln   = -> wins().filter (w) -> w != mainWin
winWithId = (id) -> BrowserWindow.fromId id
    
neighborWin = (winId, direction) ->
    
    kachel = winWithId winId
    kb = kachel.getBounds()
    ks = kacheln().filter (k) -> k != kachel
    ks = ks.filter (k) ->
        b = k.getBounds()
        switch direction
            when 'right' then b.x >= kb.x+kb.width
            when 'down'  then b.y >= kb.y+kb.height
            when 'left'  then kb.x >= b.x+b.width 
            when 'up'    then kb.y >= b.y+b.height

    return kachel if empty ks
            
    ks.sort (a,b) ->
        ab = a.getBounds()
        bb = b.getBounds()
        switch direction
            when 'right' 
                a = Math.abs((kb.y+kb.height/2) - (ab.y+ab.height/2)) + (ab.x - kb.x)
                b = Math.abs((kb.y+kb.height/2) - (bb.y+bb.height/2)) + (bb.x - kb.x)
            when 'left'  
                a = Math.abs((kb.y+kb.height/2) - (ab.y+ab.height/2)) + (kb.x - ab.x)
                b = Math.abs((kb.y+kb.height/2) - (bb.y+bb.height/2)) + (kb.x - bb.x)
            when 'down'  
                a = Math.abs((kb.x+kb.width/2) - (ab.x+ab.width/2)) + (ab.y - kb.y)
                b = Math.abs((kb.x+kb.width/2) - (bb.x+bb.width/2)) + (bb.y - kb.y)
            when 'up'    
                a = Math.abs((kb.x+kb.width/2) - (ab.x+ab.width/2)) + (kb.y - ab.y)
                b = Math.abs((kb.x+kb.width/2) - (bb.x+bb.width/2)) + (kb.y - bb.y)
        a-b
    ks[0]
                
relWin = (winId, delta) ->
    wl = wins()
    w = BrowserWindow.fromId winId
    wi = wl.indexOf w
    wl[(wl.length+wi+delta)%wl.length]
