###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, prefs, slash, clamp, empty, klog, kpos, app, os, _ } = require 'kxk'

Data     = require './data'
Bounds   = require './bounds'
electron = require 'electron'
BrowserWindow = electron.BrowserWindow

kachelSizes = [72 108 144 216]
kachelDict  = {}
kachelWids  = {}
dragging    = false
mainWin     = null
focusKachel = null
hoverKachel = null
mouseTimer  = null
data        = null
mousePos    = kpos 0 0

setKachelBounds = (kachel, b) -> Bounds.setBounds kachel, b
    
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
    onActivate:         -> klog 'onActivate'; post.emit 'raiseKacheln'
    onWillShowWin:      -> post.emit 'raiseKacheln'
    onOtherInstance:    -> post.emit 'raiseKacheln'
    onShortcut:         -> post.emit 'raiseKacheln'
    onQuit:             -> clearInterval mouseTimer
    resizable:          false
    maximizable:        false
    saveBounds:         false
    onWinReady: (win) =>
        
        Bounds.init()
        
        electron.powerSaveBlocker.start 'prevent-app-suspension'
        
        mainWin = win
        win.setHasShadow false
        win.on 'focus' -> # klog 'onWinFocus should safely raise kacheln'; # post.emit 'raiseKacheln'
        
        data = new Data
        
        for kachelId in prefs.get 'kacheln' []
            if kachelId not in ['appl' 'folder' 'file']
                post.emit 'newKachel' kachelId

        post.on 'mouse'    onMouse
        post.on 'keyboard' onKeyboard
                
# 00     00   0000000   000   000   0000000  00000000  
# 000   000  000   000  000   000  000       000       
# 000000000  000   000  000   000  0000000   0000000   
# 000 0 000  000   000  000   000       000  000       
# 000   000   0000000    0000000   0000000   00000000  
      
lockRaise = false

onMouse = (mouseData) -> 
    
    return if mouseData.type != 'mousemove'
    return if dragging
    
    mousePos  = kpos mouseData
    if os.platform() == 'win32'
        mousePos = kpos(electron.screen.screenToDipPoint mousePos).rounded()
    
    screenSize = kpos Bounds.screenWidth, Bounds.screenHeight
    mousePos   = mousePos.clamp kpos(0,0), screenSize

    if Bounds.posInBounds mousePos, Bounds.infos.kachelBounds
        if k = Bounds.kachelAtPos mousePos
            if not hoverKachel or hoverKachel != k.kachel.id

                post.toWin hoverKachel, 'leave' if hoverKachel
                hoverKachel = k.kachel.id
                if focusKachel?.isFocused() and hoverKachel != focusKachel.id
                    focusKachel = winWithId hoverKachel
                    focusKachel.focus()
                else
                    post.toWin hoverKachel, 'hover'
                    
            else if mousePos.x == 0 or mousePos.x >= Bounds.screenWidth-2 or mousePos.y == 0 or mousePos.y >= Bounds.screenHeight-2
                post.emit 'raiseKacheln'
        else
            lockRaise = false

# 000   000  00000000  000   000  0000000     0000000    0000000   00000000   0000000    
# 000  000   000        000 000   000   000  000   000  000   000  000   000  000   000  
# 0000000    0000000     00000    0000000    000   000  000000000  0000000    000   000  
# 000  000   000          000     000   000  000   000  000   000  000   000  000   000  
# 000   000  00000000     000     0000000     0000000   000   000  000   000  0000000    

onKeyboard = (data) ->
    
#  0000000   00000000   00000000    0000000  
# 000   000  000   000  000   000  000       
# 000000000  00000000   00000000   0000000   
# 000   000  000        000             000  
# 000   000  000        000        0000000   

activeApps = {}
onApps = (apps) ->

    active = {}
    for app in apps
        if wid = kachelWids[slash.path app]
            active[slash.path app] = wid
            
    if not _.isEqual activeApps, active
        # klog active
        for kid,wid of kachelWids
            # klog kid,wid
            if active[kid] and not activeApps[kid]
                klog 'activated' kid
            else if not active[kid] and activeApps[kid]
                klog 'deactivated' kid
        activeApps = active
    
post.on 'apps' onApps
    
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
        
    # klog '+' html, id
    
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
    
    win.webContents.on 'dom-ready' (event) ->
        wid = event.sender.id
        post.toWin wid, 'initKachel' id
        winWithId(wid).show()
        Bounds.getInfos()
          
    win.on 'close' onKachelClose
    win.setHasShadow false    
            
    win
        
#  0000000  000   000   0000000   00000000   
# 000       0000  000  000   000  000   000  
# 0000000   000 0 000  000000000  00000000   
#      000  000  0000  000   000  000        
# 0000000   000   000  000   000  000        

post.on 'dragStart' (wid) -> dragging = true

post.on 'dragStop'  (wid) -> dragging = false

post.on 'snapKachel' (wid) -> 

    kachel = winWithId wid
    setKachelBounds kachel, Bounds.snap kachel

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
        
    if info = Bounds.overlapInfo nb
        
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
        
    if neighbor = Bounds.nextNeighbor kachel, dir
        if neighbor.bounds.width == b.width
            Bounds.setBounds kachel, neighbor.bounds
            Bounds.setBounds neighbor.kachel, b
            return
        
    setKachelBounds kachel, Bounds.isOnScreen(nb) and nb or b

post.on 'kachelBounds' (wid, kachelId) ->
    
    bounds = prefs.get "bounds▸#{kachelId}"
    if bounds?
        setKachelBounds winWithId(wid), bounds
        
    kachelDict[wid] = kachelId
    kachelWids[kachelId] = wid
        
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
    setKachelBounds w, Bounds.snap w, b
        
# 00000000    0000000   000   0000000  00000000
# 000   000  000   000  000  000       000     
# 0000000    000000000  000  0000000   0000000 
# 000   000  000   000  000       000  000     
# 000   000  000   000  000  0000000   00000000

post.on 'raiseKacheln' ->
    
    return if not mainWin?
    return if lockRaise
    
    lockRaise = true
    
    fk = focusKachel

    for win in wins()
        win.show()
            
    raiseWin fk ? mainWin
    
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
    if winId != mainWin.id
        focusKachel = winWithId winId
        
onKachelClose = (event) ->
    if focusKachel == event.sender
        focusKachel = null 
    setTimeout (-> post.emit 'bounds' 'dirty'), 200
                    
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   

wins      = -> BrowserWindow.getAllWindows()
activeWin = -> BrowserWindow.getFocusedWindow()
winWithId = (id) -> BrowserWindow.fromId id
    
neighborWin = (winId, direction) ->
    
    kachel = winWithId winId
    kb = kachel.getBounds()
    ks = wins().filter (k) ->
        return false if k == kachel
        b = k.getBounds()
        switch direction
            when 'right' then b.x  >= kb.x+kb.width
            when 'down'  then b.y  >= kb.y+kb.height
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
    
        