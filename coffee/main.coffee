###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, prefs, slash, clamp, empty, klog, kpos, kstr, app, os, _ } = require 'kxk'

Data     = require './data'
Bounds   = require './bounds'
electron = require 'electron'
wxw      = require 'wxw'
BrowserWindow = electron.BrowserWindow

kachelDict  = {}
kachelWids  = {}
kachelIds   = null
dragging    = false
mainWin     = null
focusKachel = null
hoverKachel = null
mouseTimer  = null
data        = null
swtch       = null
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
    
KachelApp = new app
    
    dir:                __dirname
    pkg:                require '../package.json'
    shortcut:           slash.win() and 'Ctrl+F1' or 'Command+F1'
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
    closable:           false
    saveBounds:         false
    onQuit: -> klog 'onQuit'; data.detach()
    onWinReady: (win) =>
        
        Bounds.init()
        
        electron.powerSaveBlocker.start 'prevent-app-suspension'
        
        mainWin = win
        win.setHasShadow false
        win.on 'focus' -> # klog 'onWinFocus should safely raise kacheln'; # post.emit 'raiseKacheln'
                
        data = new Data
        
        keys = 
            left:       'alt+ctrl+left'
            right:      'alt+ctrl+right'
            up:         'alt+ctrl+up'
            down:       'alt+ctrl+down'
            topleft:    'alt+ctrl+1'
            botleft:    'alt+ctrl+2'
            topright:   'alt+ctrl+3'
            botright:   'alt+ctrl+4'
            top:        'alt+ctrl+5'
            bot:        'alt+ctrl+6'
            minimize:   'alt+ctrl+m'
            close:      'alt+ctrl+w'
            taskbar:    'alt+ctrl+t'
            appswitch:  'ctrl+tab'
            screenzoom: 'alt+z'
            
        keys = prefs.get 'keys', keys
        prefs.set 'keys' keys
        prefs.save()
        
        for a in _.keys keys
            electron.globalShortcut.register keys[a], ((a) -> -> action a)(a)
        
        kachelIds = prefs.get 'kacheln' []
        for kachelId in kachelIds
            if kachelId not in ['appl' 'folder' 'file']
                post.emit 'newKachel' kachelId
                        
        post.on 'mouse'    onMouse
        post.on 'keyboard' onKeyboard        
        
startData = ->
    
    getSwitch()
    Bounds.update()
    data.start()
    
        
#  0000000  000   000  000  000000000   0000000  000   000  
# 000       000 0 000  000     000     000       000   000  
# 0000000   000000000  000     000     000       000000000  
#      000  000   000  000     000     000       000   000  
# 0000000   00     00  000     000      0000000  000   000  

getSwitch = ->
    
    if not swtch or swtch.isDestroyed()
        swtch = require('./switch').start()
        swtch.on 'close' -> swtch = null
    swtch
    
onAppSwitch = -> 

    getSwitch()
    post.toWin swtch.id, 'nextApp'
    
#  0000000    0000000  000000000  000   0000000   000   000  
# 000   000  000          000     000  000   000  0000  000  
# 000000000  000          000     000  000   000  000 0 000  
# 000   000  000          000     000  000   000  000  0000  
# 000   000   0000000     000     000   0000000   000   000  

action = (act) ->

    switch act
        when 'maximize'   then log wxw 'maximize' 'top'
        when 'minimize'   then log wxw 'minimize' 'top'
        when 'taskbar'    then log wxw 'taskbar'  'toggle'
        when 'close'      then log wxw 'close'    'top'
        when 'screenzoom' then require('./zoom').start debug:false
        when 'appswitch'  then onAppSwitch()
        else moveWindow act
        
# 00     00   0000000   000   000  00000000  
# 000   000  000   000  000   000  000       
# 000000000  000   000   000 000   0000000   
# 000 0 000  000   000     000     000       
# 000   000   0000000       0      00000000  

moveWindow = (dir) ->
    
    if os.platform() == 'darwin'
        ar = w:Bounds.screenWidth, h:Bounds.screenHeight
    else
        screen = wxw 'screen' 'user'
        ar = w:screen.width, h:screen.height
    
    # if os.platform() == 'darwin'
#         
        # [x,y,w,h] = switch dir
            # when 'left'     then [0,          0,        ar.w/2, ar.h]
            # when 'right'    then [ar.w/2,     0,        ar.w/2, ar.h]
            # when 'down'     then [ar.w/4,     0,        ar.w/2, ar.h]
            # when 'up'       then [ar.w/6,     0,    2/3*ar.w,   ar.h]
            # when 'topleft'  then [0,          0,        ar.w/3, ar.h/2]
            # when 'top'      then [ar.w/3,     0,        ar.w/3, ar.h/2]
            # when 'topright' then [2/3*ar.w,   0,        ar.w/3, ar.h/2]
            # when 'botleft'  then [0,          ar.h/2,   ar.w/3, ar.h/2]
            # when 'bot'      then [ar.w/3,     ar.h/2,   ar.w/3, ar.h/2]
            # when 'botright' then [2/3*ar.w,   ar.h/2,   ar.w/3, ar.h/2]
#         
        # klog 'wxw bounds' 'top', parseInt(x), parseInt(y), parseInt(w), parseInt(h)
        # wxw 'bounds', 'top', parseInt(x), parseInt(y), parseInt(w), parseInt(h)
#             
        # return
    
    if os.platform() == 'darwin'   
        for info in lastWins
            if info.index == 0
                break
    else
        info = wxw('info' 'top')[0]
        
    if info
                
        base = slash.base info.path
        
        return if base in ['kachel' 'kappo']
        
        b = 0

        if base in ['electron' 'ko' 'konrad' 'clippo' 'klog' 'kaligraf' 'kalk' 'uniko' 'knot' 'space' 'ruler']
            b = 0  # sane window border
        else if base in ['devenv']
            b = -1  # wtf?
        else
            b = 10 # transparent window border
        
        wr = x:info.x, y:info.y, w:info.width, h:info.height
        d = 2*b
        [x,y,w,h] = switch dir
            when 'left'     then [-b,         0,        ar.w/2+d, ar.h+b]
            when 'right'    then [ar.w/2-b,   0,        ar.w/2+d, ar.h+b]
            when 'down'     then [ar.w/4-b,   0,        ar.w/2+d, ar.h+b]
            when 'up'       then [ar.w/6-b,   0,    2/3*ar.w+d,   ar.h+b]
            when 'topleft'  then [-b,         0,        ar.w/3+d, ar.h/2]
            when 'top'      then [ar.w/3-b,   0,        ar.w/3+d, ar.h/2]
            when 'topright' then [2/3*ar.w-b, 0,        ar.w/3+d, ar.h/2]
            when 'botleft'  then [-b,         ar.h/2-b, ar.w/3+d, ar.h/2+d]
            when 'bot'      then [ar.w/3-b,   ar.h/2-b, ar.w/3+d, ar.h/2+d]
            when 'botright' then [2/3*ar.w-b, ar.h/2-b, ar.w/3+d, ar.h/2+d]
        
        sl = 20 > Math.abs wr.x -  x
        sr = 20 > Math.abs wr.x+wr.w - (x+w)
        st = 20 > Math.abs wr.y -  y
        sb = 20 > Math.abs wr.y+wr.h - (y+h)
        
        if sl and sr and st and sb
            switch dir
                when 'left'  then w = ar.w/4+d
                when 'right' then w = ar.w/4+d; x = 3*ar.w/4-b
                when 'down'  then h = ar.h/2+d; y = ar.h/2-b
                when 'up'    then w = ar.w+d;   x = -b
        
        klog 'wxw bounds' info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h)
        wxw 'bounds' info.id, parseInt(x), parseInt(y), parseInt(w), parseInt(h)
        
    else 
        klog 'no info!'
        
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
                lockRaise = false
                return
                                    
            if mousePos.x == 0 or mousePos.x >= Bounds.screenWidth-2 or mousePos.y == 0 or mousePos.y >= Bounds.screenHeight-2
                if not lockRaise
                    if os.platform() == 'win32'
                        tmpTop = true
                    post.emit 'raiseKacheln'
                    
            if not hoverKachel or hoverKachel != k.kachel.id

                post.toWin hoverKachel, 'leave' if hoverKachel
                hoverKachel = k.kachel.id
                post.toWin hoverKachel, 'hover'
                    
            return
           
    lockRaise = false

    if tmpTop and os.platform() == 'win32'
        app = slash.base process.argv[0]
        for win in wxw 'info'
            if slash.base(win.path) != app
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
    # klog 'apps ------------ ' apps.length
    # klog apps
    active = {}
    for app in apps
        if wid = kachelWids[slash.path app]
            active[slash.path app] = wid
            
    if not _.isEqual activeApps, active
        for kid,wid of kachelWids
            if active[kid] and not activeApps[kid]
                post.toWin wid, 'app' 'activated' kid
            else if not active[kid] and activeApps[kid]
                post.toWin wid, 'app' 'terminated' kid
        activeApps = active
    
post.on 'apps' onApps
    
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   


lastWins = []
activeWins = {}
onWins = (wins) ->

    lastWins = wins
    
    return if mainWin.isDestroyed()
        
    if os.platform() == 'win32'
        top = wxw('info' 'top')[0]
        for w in wins
            if kstr(w.id) == kstr(top.id)
                w.status += ' top'
                break
        if top.id == wins[0].id
            tmpTop = false
    else
        for w in wins
            if w.index == 0
                top = w
                break

    if top
        active = slash.base(top.path).toLowerCase() in ['electron' 'kachel']
        post.toWin mainWin.id, 'showDot' active
        if not active then lockRaise = false
    
    pl = {}
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
post.onGet 'wins' -> lastWins

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
        Bounds.update()
          
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
    
    if kachelIds
        if kachelIds.length == _.size kachelDict
            kachelIds = null
            setTimeout startData, 2000
    
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
        for win in kacheln()
            win.show()
    
    if not tmpTop
        raiseWin fk ? mainWin
    
raiseWin = (win) ->
    win.showInactive()
    win.focus()

post.on 'quit' KachelApp.quitApp
post.on 'hide' -> for w in kacheln() then w.hide()

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
kacheln   = -> wins().filter (w) -> w.id != swtch?.id
activeWin = -> BrowserWindow.getFocusedWindow()
winWithId = (id) -> BrowserWindow.fromId id

global.kacheln = kacheln
            