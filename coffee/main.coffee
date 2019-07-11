###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, prefs, slash, clamp, empty, klog, kpos, app, os } = require 'kxk'

Bounds   = require './bounds'
electron = require 'electron'
BrowserWindow = electron.BrowserWindow

kachelSizes = [72,108,144,216]
kachelSize  = 1
dragging    = false
mainWin     = null
focusKachel = null
mouseTimer  = null
mousePos    = kpos 0,0
infos       = []
providers   = {}

updateInfos = -> infos = Bounds.getInfos kacheln()

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
    prefsSeperator:     '▸'
    onOtherInstance:    -> post.emit 'raiseKacheln'
    onShortcut:         -> post.emit 'raiseKacheln'
    onQuit:             -> clearInterval mouseTimer
    resizable:          false
    maximizable:        false
    saveBounds:         false
    onWinReady: (win) =>
        
        mainWin = win
        winEvents win
        
        for kachelId,kachelData of prefs.get 'kacheln' {}
            if kachelId not in ['appl' 'folder']
                post.emit 'newKachel' kachelData

        # 00     00   0000000   000   000   0000000  00000000  
        # 000   000  000   000  000   000  000       000       
        # 000000000  000   000  000   000  0000000   0000000   
        # 000 0 000  000   000  000   000       000  000       
        # 000   000   0000000    0000000   0000000   00000000  
        
        checkMouse = =>
            
            return if dragging
            oldPos = kpos mousePos ? {x:0 y:0}
            mousePos = electron.screen.getCursorScreenPoint()
            if oldPos.distSquare(mousePos) < 10 then return
            if infos?.kachelBounds? 
                if not Bounds.contains infos.kachelBounds, mousePos
                    return
            if k = Bounds.kachelAtPos infos, mousePos
                if focusKachel
                    if focusKachel.id != k.kachel.id
                        k.kachel.focus()
                else
                    k.kachel.focus()
                
        mouseTimer = setInterval checkMouse, 50

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
        transparent:        true
        hasShadow:          false
        frame:              false
        resizable:          false
        maximizable:        false
        minimizable:        false
        fullscreen:         false
        show:               false
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
          
    win.on 'close' onKachelClose
        
    winEvents win
    win
        
#  0000000  000   000   0000000   00000000   
# 000       0000  000  000   000  000   000  
# 0000000   000 0 000  000000000  00000000   
#      000  000  0000  000   000  000        
# 0000000   000   000  000   000  000        

post.on 'dragStart' (wid) -> 
    dragging = true

post.on 'dragStop'  (wid) -> 
    dragging = false

post.on 'snapKachel' (wid) -> 

    updateInfos()
    Bounds.snap infos, winWithId wid
    updateInfos()

# 00     00   0000000   000   000  00000000  
# 000   000  000   000  000   000  000       
# 000000000  000   000   000 000   0000000   
# 000 0 000  000   000     000     000       
# 000   000   0000000       0      00000000  

post.on 'kachelMove' (dir, wid) ->
    
    kachel = winWithId wid
    b = Bounds.validBounds kachel
          
    nb = x:b.x, y:b.y, width:b.width, height:b.height
    switch dir 
        when 'up'       then nb.y = b.y - b.height
        when 'down'     then nb.y = b.y + b.height
        when 'right'    then nb.x = b.x + b.width 
        when 'left'     then nb.x = b.x - b.width 
        
    if info = Bounds.overlapInfo infos, nb
        
        gap = (s, d, f, b, o) ->
            g = f b, o
            if g > 0
                nb[d] = b[d] + s * g
                kachel.setBounds nb
                updateInfos()
                true
                
        r = switch dir 
            when 'up'    then gap -1 'y' Bounds.gapUp,    b, info.bounds
            when 'down'  then gap +1 'y' Bounds.gapDown,  b, info.bounds
            when 'right' then gap +1 'x' Bounds.gapRight, b, info.bounds
            when 'left'  then gap -1 'x' Bounds.gapLeft,  b, info.bounds
        return if r
        
    if neighbor = Bounds.nextNeighbor infos, kachel, dir
        if neighbor.bounds.width == b.width
            kachel.setBounds neighbor.bounds
            neighbor.kachel.setBounds b
            updateInfos()
            return
        
    if Bounds.isOnScreen nb
        kachel.setBounds nb
    else    
        kachel.setBounds b
    updateInfos()

post.on 'kachelBounds' (wid, kachelId) ->
    
    bounds = prefs.get "bounds▸#{kachelId}"
    if bounds?
        winWithId(wid).setBounds bounds
        updateInfos()
    
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
    
    for win in kacheln()
        if not win.isVisible()
            raised = false
            break
            
    raising = true
    if raised
        for win in kacheln()
            win.hide()
        raised  = false
        raising = false
        return
        
    for win in kacheln().concat [mainWin]
        if os.platform() == 'win32'
            raiseWin win
        else
            win.showInactive()
    raised = true
    raiseWin focusKachel ? mainWin
    raising = false
    
raiseWin = (win) ->
    win.showInactive()
    win.focus()

post.on 'quit' KachelApp.quitApp

# 00000000   0000000    0000000  000   000   0000000  
# 000       000   000  000       000   000  000       
# 000000    000   000  000       000   000  0000000   
# 000       000   000  000       000   000       000  
# 000        0000000    0000000   0000000   0000000   

post.on 'focusKachel' (winId, direction) -> raiseWin neighborWin winId, direction
   
post.on 'kachelFocus' (winId) -> 
    if winId != mainWin.id and not raising
        focusKachel = winWithId winId
        
onKachelClose = (event) ->
    if focusKachel == event.sender
        focusKachel = null 
    setTimeout updateInfos, 200
        
onWinBlur = (event) -> 
    if not raising and event.sender == focusKachel
        raised = false

onWinFocus = (event) -> 
    if not raising
        raised = true
            
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
    
post.on 'requestData' (provider, wid) ->
    
    if not providers[provider]
        providers[provider] = new (require "./#{provider}")
        
    providers[provider].addReceiver wid
    
post.onGet 'getData' (provider) ->
    
    providers[provider]?.getData()
    