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
wxw      = require 'wxw'
BrowserWindow = electron.BrowserWindow

kachelDict  = {}
kachelWids  = {}
dragging    = false
mainWin     = null
focusKachel = null
hoverKachel = null
mouseTimer  = null
data        = null
mousePos    = kpos 0 0

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
    minWidth:           Bounds.kachelSizes[0]
    minHeight:          Bounds.kachelSizes[0]
    maxWidth:           Bounds.kachelSizes[0]
    maxHeight:          Bounds.kachelSizes[0]
    width:              Bounds.kachelSizes[0]
    height:             Bounds.kachelSizes[0]
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
    onQuit: -> klog 'onQuit'; data.detach()
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
                        
        for s in [1..8]
            setTimeout data.providers.apps.start, s*1000
            setTimeout data.providers.wins.start, s*1000
                
        post.on 'mouse'    onMouse
        post.on 'keyboard' onKeyboard
        
# 00     00   0000000   000   000   0000000  00000000  
# 000   000  000   000  000   000  000       000       
# 000000000  000   000  000   000  0000000   0000000   
# 000 0 000  000   000  000   000       000  000       
# 000   000   0000000    0000000   0000000   00000000  
    
tmpTopTimer = null
lockRaise = false
tmpTop = false

onMouse = (mouseData) ->
    
    return if mouseData.event != 'mousemove'
    return if global.dragging
    
    mousePos = kpos mouseData

    if Bounds.posInBounds mousePos, Bounds.infos.kachelBounds
        if k = Bounds.kachelAtPos mousePos
            
            if k.kachel?.isDestroyed?()
                # klog 'kachel destroyed!'
                lockRaise = false
                return
                                    
            if mousePos.x == 0 or mousePos.x >= Bounds.screenWidth-2 or mousePos.y == 0 or mousePos.y >= Bounds.screenHeight-2
                if not lockRaise
                    tmpTop = true
                    post.emit 'raiseKacheln'
                    
            if not hoverKachel or hoverKachel != k.kachel.id

                post.toWin hoverKachel, 'leave' if hoverKachel
                hoverKachel = k.kachel.id
                if false # focusKachel?.isFocused() and hoverKachel != focusKachel.id
                    focusKachel = winWithId hoverKachel
                    focusKachel.focus()
                else
                    post.toWin hoverKachel, 'hover'
                    
            return
           
    lockRaise = false

    if tmpTop
        for win in wxw 'info'
            if slash.base(win.path) != 'kachel'
                tmpTop = false
                wxw 'raise' win.id
                clearTimeout tmpTopTimer
                tmpTopTimer = setTimeout (-> wxw 'raise' win.id), 500
                return

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
        for kid,wid of kachelWids
            if active[kid] and not activeApps[kid]
                # klog 'activated' kid
                post.toWin wid, 'app' 'activated' kid
            else if not active[kid] and activeApps[kid]
                # klog 'terminated' kid
                post.toWin wid, 'app' 'terminated' kid
        activeApps = active
    
post.on 'apps' onApps
    
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   

activeWins = {}
onWins = (wins) ->

    pl = {}

    if os.platform() == 'win32'
        top = wxw('info' 'top')[0]
        for w in wins
            if w.id == top.id
                w.status += ' top'
                break
        if top.id == wins[0].id
            tmpTop = false
    else
        top = wins[0]
            
    post.toWin mainWin.id, 'showDot' slash.base(top.path).toLowerCase() in ['electron' 'kachel']
    
    for win in wins
        wp = slash.path win.path
        if wid = kachelWids[wp]
            pl[wp] ?= []
            pl[wp].push win
         
    for kid,wins of pl
        if not _.isEqual activeWins[kid], wins
            activeWins[kid] = pl[kid]
            post.toWin kachelWids[kid], 'win' wins
            
    for kid,wins of activeWins
        if not pl[kid]
            post.toWin kachelWids[kid], 'win' []
            activeWins[kid] = []
        
post.on 'wins' onWins

# 000   000   0000000    0000000  000   000  00000000  000      
# 000  000   000   000  000       000   000  000       000      
# 0000000    000000000  000       000000000  0000000   000      
# 000  000   000   000  000       000   000  000       000      
# 000   000  000   000   0000000  000   000  00000000  0000000  

post.on 'newKachel' (id) ->

    return if id == 'main'
    
    if kachelWids[id]
        raiseWin winWithId kachelWids[id]
        return
    
    kachelSize = 1

    html = id
    if id.startsWith 'start'
        html = 'start'
        kachelSize = 0
    else if id.endsWith('.app') or id.endsWith('.exe')
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
        width:              Bounds.kachelSizes[kachelSize]
        height:             Bounds.kachelSizes[kachelSize]
        maxWidth:           Bounds.kachelSizes[kachelSize]
        maxHeight:          Bounds.kachelSizes[kachelSize]
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

post.on 'dragStart' (wid) -> global.dragging = true

post.on 'dragStop'  (wid) -> global.dragging = false

post.on 'snapKachel' (wid) -> Bounds.snap winWithId wid
    
# 00     00   0000000   000   000  00000000  
# 000   000  000   000  000   000  000       
# 000000000  000   000   000 000   0000000   
# 000 0 000  000   000     000     000       
# 000   000   0000000       0      00000000  

post.on 'kachelMove' (dir, wid) -> 

    kachel = winWithId wid
    Bounds.moveKachel kachel, dir
    
post.on 'kachelBounds' (wid, kachelId) ->
    
    bounds = prefs.get "bounds▸#{kachelId}"
    if bounds?
        Bounds.setBounds winWithId(wid), bounds
        
    kachelDict[wid] = kachelId
    kachelWids[kachelId] = wid
    
    if activeApps[kachelId]
        post.toWin wid, 'app' 'activated' kachelId
        
#  0000000  000  0000000  00000000  
# 000       000     000   000       
# 0000000   000    000    0000000   
#      000  000   000     000       
# 0000000   000  0000000  00000000  

post.on 'kachelSize' (action, wid) ->
    
    size = 0
    while Bounds.kachelSizes[size] < winWithId(wid).getBounds().width
        size++
    
    switch action
        when 'increase' then size += 1; return if size > Bounds.kachelSizes.length-1
        when 'decrease' then size -= 1; return if size < 0
        when 'reset'    then return if size == 1; size = 1
   
    w = winWithId wid
    
    b = w.getBounds()
    b.width  = Bounds.kachelSizes[size]
    b.height = Bounds.kachelSizes[size]
    Bounds.snap w, b
        
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

    if os.platform() == 'win32'
        wxw 'raise' 'kachel.exe'
    else
        for win in wins()
            win.show()
    
    if not tmpTop
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

post.on 'focusNeighbor' (winId, direction) -> raiseWin Bounds.neighborKachel winWithId(winId), direction
   
post.on 'kachelFocus' (winId) ->
    
    if winId != mainWin.id
        focusKachel = winWithId winId
        
onKachelClose = (event) ->
    
    kachel = event.sender
    if focusKachel == kachel
        focusKachel = null
        
    if hoverKachel == kachel.id
        hoverKachel = null
        
    Bounds.remove kachel
        
    if kachelId = kachelDict[kachel.id]
        delete kachelWids[kachelId]
        delete kachelDict[kachel.id]
        
    setTimeout (-> post.emit 'bounds' 'dirty'), 200
                    
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   

wins      = -> BrowserWindow.getAllWindows()
activeWin = -> BrowserWindow.getFocusedWindow()
winWithId = (id) -> BrowserWindow.fromId id
            