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
dragging    = false
mainWin     = null
focusKachel = null
hoverKachel = null
mouseTimer  = null
mousePos    = kpos 0,0
infos       = []
providers   = {}

updateInfos = -> infos = Bounds.getInfos kacheln()

setKachelBounds = (kachel, b) ->
    Bounds.setBounds kachel, b
    updateInfos()

winEvents = (win) ->
    win.on 'focus'  onWinFocus
    win.on 'blur'   onWinBlur
    win.setHasShadow false
    
indexData = (jsFile) ->
    
    html = """
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'">
            <link rel="stylesheet" href="./css/style.css" type="text/css">
            <link rel="stylesheet" href="./css/dark.css" type="text/css" id="style-link">
          </head>
          <body>
            <div id="main" tabindex="0"></div>
          </body>
          <script>
            Kachel = require("./#{jsFile}.js");
            new Kachel({});
          </script>
        </html>
    """
    
    "data:text/html;charset=utf-8," + encodeURI html
    
shortcut = slash.win() and 'ctrl+alt+k' or 'command+alt+k'

KachelApp = new app
    dir:                __dirname
    pkg:                require '../package.json'
    shortcut:           shortcut
    index:              indexData 'mainwin'
    indexURL:           "file://#{__dirname}/../js/index.html"
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
    onActivate:         -> post.emit 'raiseKacheln'
    onWillShowWin:      -> post.emit 'raiseKacheln'
    onOtherInstance:    -> post.emit 'raiseKacheln'
    onShortcut:         -> post.emit 'raiseKacheln'
    onQuit:             -> clearInterval mouseTimer
    resizable:          false
    maximizable:        false
    saveBounds:         false
    onWinReady: (win) =>
        
        mainWin = win
        winEvents win
        
        for kachelId in prefs.get 'kacheln' []
            if kachelId not in ['appl' 'folder' 'file']
                post.emit 'newKachel' kachelId

        # 00     00   0000000   000   000   0000000  00000000  
        # 000   000  000   000  000   000  000       000       
        # 000000000  000   000  000   000  0000000   0000000   
        # 000 0 000  000   000  000   000       000  000       
        # 000   000   0000000    0000000   0000000   00000000  
        
        checkMouse = =>
            
            # klog focusKachel?.isDestroyed()
            return if dragging
            oldPos = kpos mousePos ? {x:0 y:0}
            mousePos = electron.screen.getCursorScreenPoint()
            if oldPos.distSquare(mousePos) < 10 then return
            if infos?.kachelBounds? 
                if not Bounds.contains infos.kachelBounds, mousePos
                    return
            if k = Bounds.kachelAtPos infos, mousePos
                if not hoverKachel or hoverKachel != k.kachel.id
                    post.toWin hoverKachel, 'leave' if hoverKachel
                    hoverKachel = k.kachel.id
                    if focusKachel?.isFocused() and hoverKachel != focusKachel.id
                        focusKachel = winWithId hoverKachel
                        focusKachel.focus()
                    else
                        post.toWin hoverKachel, 'hover'
                
        mouseTimer = setInterval checkMouse, 50

# KachelApp.app.on 'activate'             -> klog 'KachelApp.app.on activate'
# KachelApp.app.on 'browser-window-focus' -> klog 'KachelApp.app.on browser-window-focus'
        
# 000   000   0000000    0000000  000   000  00000000  000      
# 000  000   000   000  000       000   000  000       000      
# 0000000    000000000  000       000000000  0000000   000      
# 000  000   000   000  000       000   000  000       000      
# 000   000  000   000   0000000  000   000  00000000  0000000  

post.on 'newKachel' (id) ->

    return if id == 'main'
    
    kachelSize = 1

    html = id
    if id.endsWith('.app') or id.endsWith('.exe')
        if slash.base(id) == 'konrad'
            html = 'konrad'
            kachelSize = 2
        else
            html = 'appl'
            kachelSize = 0
    else if id.startsWith('/') or id[1] == ':'
        html = 'folder'
        kachelSize = 0
        
    switch html
        when 'saver' then kachelSize = 0
        when 'sysdish' 'sysinfo' 'clock' 'default' then kachelSize = 2
        
    klog '+' html, id
    
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
        
    win.loadURL indexData(html), baseURLForDataURL:"file://#{__dirname}/../js/index.html"
    
    # win.on 'ready-to-show' -> 
        # win.show()
        # win.openDevTools()
    
    win.webContents.on 'dom-ready' (event) ->
        wid = event.sender.id
        post.toWin wid, 'initKachel' id
        winWithId(wid).show()
          
    win.on 'close' onKachelClose
        
    winEvents win
    win
        
#  0000000  000   000   0000000   00000000   
# 000       0000  000  000   000  000   000  
# 0000000   000 0 000  000000000  00000000   
#      000  000  0000  000   000  000        
# 0000000   000   000  000   000  000        

post.on 'dragStart' (wid) -> dragging = true

post.on 'dragStop'  (wid) -> dragging = false

post.on 'snapKachel' (wid) -> 

    updateInfos()
    kachel = winWithId wid
    setKachelBounds kachel, Bounds.snap infos, kachel

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
                setKachelBounds kachel, nb
                true
                
        r = switch dir 
            when 'up'    then gap -1 'y' Bounds.gapUp,    b, info.bounds
            when 'down'  then gap +1 'y' Bounds.gapDown,  b, info.bounds
            when 'right' then gap +1 'x' Bounds.gapRight, b, info.bounds
            when 'left'  then gap -1 'x' Bounds.gapLeft,  b, info.bounds
        return if r
        
    if neighbor = Bounds.nextNeighbor infos, kachel, dir
        if neighbor.bounds.width == b.width
            Bounds.setBounds kachel, neighbor.bounds
            Bounds.setBounds neighbor.kachel, b
            updateInfos()
            return
        
    setKachelBounds kachel, Bounds.isOnScreen(nb) and nb or b

post.on 'kachelBounds' (wid, kachelId) ->
    
    bounds = prefs.get "bounds▸#{kachelId}"
    if bounds?
        setKachelBounds winWithId(wid), bounds
        
#  0000000  000  0000000  00000000  
# 000       000     000   000       
# 0000000   000    000    0000000   
#      000  000   000     000       
# 0000000   000  0000000  00000000  

post.on 'kachelSize' (action, wid) ->
    
    size = 0
    while kachelSizes[size] < winWithId(wid).getBounds().width
        size++
    
    switch action
        when 'increase' then size += 1; return if size > kachelSizes.length-1
        when 'decrease' then size -= 1; return if size < 0
        when 'reset'    then return if size == 1; size = 1
   
    w = winWithId wid
    
    b = w.getBounds()
    b.width  = kachelSizes[size]
    b.height = kachelSizes[size]
    setKachelBounds w, Bounds.snap infos, w, b
        
# 00000000    0000000   000   0000000  00000000
# 000   000  000   000  000  000       000     
# 0000000    000000000  000  0000000   0000000 
# 000   000  000   000  000       000  000     
# 000   000  000   000  000  0000000   00000000

raised  = false
raising = false
        
post.on 'raiseKacheln' ->
    
    return if not mainWin?
    klog 'raiseKacheln' 
    
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
post.on 'hide' -> for w in wins() then w.hide()

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
kacheln   = -> 
    k = wins().filter (w) -> w != mainWin
    # klog 'kacheln' k.length
    k
    
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
    