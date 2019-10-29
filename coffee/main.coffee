###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, prefs, slash, clamp, empty, args, klog, kpos, kstr, app, os, _ } = require 'kxk'

Data      = require './data'
Bounds    = require './bounds'
KachelSet = require './kachelset'
electron  = require 'electron'
wxw       = require 'wxw'

BrowserWindow = electron.BrowserWindow

dragging  = false
mainWin   = null
kachelSet = null
data      = null
swtch     = null
mousePos  = kpos 0 0
    
menu = electron.Menu.buildFromTemplate [{
    label: "kachel",
    submenu: [{ role: 'about' }]}]

KachelApp = new app
    
    dir:                __dirname
    pkg:                require '../package.json'
    shortcut:           slash.win() and 'Ctrl+F1' or 'Command+F1'
    index:              KachelSet.html 'mainwin'
    indexURL:           slash.fileUrl slash.path slash.join slash.resolve(__dirname), '..' 'js' 'index.html'
    icon:               '../img/app.ico'
    tray:               '../img/menu.png'
    about:              '../img/about.png'
    menu:               menu
    minWidth:           Bounds.kachelSizes[0]
    minHeight:          Bounds.kachelSizes[0]
    maxWidth:           Bounds.kachelSizes[0]
    maxHeight:          Bounds.kachelSizes[0]
    width:              Bounds.kachelSizes[0]
    height:             Bounds.kachelSizes[0]
    acceptFirstMouse:   true
    prefsSeperator:     '▸'
    onActivate:         -> post.emit 'raiseKacheln'
    onWillShowWin:      -> post.emit 'raiseKacheln'
    onOtherInstance:    -> post.emit 'raiseKacheln'
    onShortcut:         -> post.emit 'raiseKacheln'
    onQuit:             -> data.detach()
    resizable:          false
    maximizable:        false
    saveBounds:         false
    onWinReady: (win) =>
        
        win.webContents.openDevTools(mode:'detach') if args.devtools
        
        Bounds.init()
        
        electron.powerSaveBlocker.start 'prevent-app-suspension'
        
        mainWin = win
        win.setHasShadow false
        win.on 'focus' -> # klog 'onWinFocus should safely raise kacheln'; # post.emit 'raiseKacheln'
                
        data = new Data
        
        if os.platform() == 'win32'
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
                maximize:   'alt+ctrl+shift+m'
                close:      'alt+ctrl+w'
                taskbar:    'alt+ctrl+t'
                appswitch:  'ctrl+tab'
                screenzoom: 'alt+z'
        else
            keys = 
                left:       'alt+command+left'
                right:      'alt+command+right'
                up:         'alt+command+up'
                down:       'alt+command+down'
                topleft:    'alt+command+1'
                botleft:    'alt+command+2'
                topright:   'alt+command+3'
                botright:   'alt+command+4'
                top:        'alt+command+5'
                bot:        'alt+command+6'
                minimize:   'alt+command+m'
                maximize:   'alt+command+shift+m'
                close:      'alt+command+w'
                taskbar:    'alt+command+t'
                appswitch:  'alt+tab'
                screenzoom: 'alt+z'
            
        keys = prefs.get 'keys' keys
        prefs.set 'keys' keys
        prefs.save()
        
        for a in _.keys keys
            electron.globalShortcut.register keys[a], ((a) -> -> action a)(a)
        
        post.on 'mouse' onMouse
        
        kachelSet = new KachelSet win.id
        kachelSet.load()
        
        post.on 'setLoaded' ->
        
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

    # klog 'action' act
    switch act
        when 'maximize'   then log wxw 'maximize' 'top'
        when 'minimize'   then log wxw 'minimize' 'top'
        when 'taskbar'    then wxw 'taskbar' 'toggle'; post.toMain 'screensize'
        when 'close'      then log wxw 'close'    'top'
        when 'screenzoom' then require('./zoom').start debug:false
        when 'appswitch'  then onAppSwitch()
        else require('./movewin') act
                
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
                                    
            if (mousePos.x == 0 or mousePos.x >= Bounds.screenWidth-2) and (mousePos.y == 0 or mousePos.y >= Bounds.screenHeight-2)
                if not lockRaise
                    if os.platform() == 'win32'
                        tmpTop = true
                    post.emit 'raiseKacheln'
                    
            if not kachelSet.hoverKachel or kachelSet.hoverKachel != k.kachel.id

                post.toWin kachelSet.hoverKachel, 'leave' if kachelSet.hoverKachel
                kachelSet.hoverKachel = k.kachel.id
                post.toWin kachelSet.hoverKachel, 'hover'
                    
            return
         
    if kachelSet.hoverKachel
        post.toWin kachelSet.hoverKachel, 'leave' if kachelSet.hoverKachel
        kachelSet.hoverKachel = null
    
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
        if wid = kachelSet.wids[slash.path app]
            active[slash.path app] = wid
            
    if not _.isEqual activeApps, active
        for kid,wid of kachelSet.wids
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
lastAnnyWins = {}

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
    
    applWins = {}
    annyWins = {}
    for win in wins
        wp = slash.path win.path
        if slash.base(wp) == 'kachel' then continue
        if slash.base(wp) == 'electron' and wp.indexOf('/kachel/') > 0 then continue
        if (wid = kachelSet.wids[wp]) and winWithId(wid).isVisible()
            applWins[wp] ?= []
            applWins[wp].push win
        else
            annyWins[wp] ?= []
            annyWins[wp].push win
         
    for kid,wins of applWins
        if not _.isEqual activeWins[kid], wins
            if kachelSet.wids[kid]
                activeWins[kid] = applWins[kid]
                post.toWin kachelSet.wids[kid], 'win' wins
                
    for kid,wins of activeWins
        if not applWins[kid]
            if kachelSet.wids[kid]
                post.toWin kachelSet.wids[kid], 'win' []
                activeWins[kid] = []
                
    if kachelSet.wids['anny']
        if not _.isEqual lastAnnyWins, annyWins
            lastAnnyWins = annyWins
            post.toWin kachelSet.wids['anny'], 'win' annyWins
        
post.on 'wins' onWins
post.onGet 'wins' -> lastWins
post.onGet 'mouse' -> mousePos
        
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
        
post.on 'updateBounds' (kachelId) ->
    
    wid = kachelSet.wids[kachelId]
    # klog 'updateBounds' wid, kachelId
    setId = prefs.get 'set' ''
    bounds = prefs.get "bounds#{setId}▸#{kachelId}"
    if bounds?
        Bounds.setBounds winWithId(wid), bounds
                
    if activeApps[kachelId]
        post.toWin wid, 'app' 'activated' kachelId
    
post.on 'kachelBounds' (wid, kachelId) ->
    
    setId = prefs.get 'set' ''
    bounds = prefs.get "bounds#{setId}▸#{kachelId}"
    if bounds?
        Bounds.setBounds winWithId(wid), bounds
                
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
    
    if kachelSet.dict[wid] == 'apps'
        Bounds.setBounds w, b
    else
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
    
    fk = kachelSet.focusKachel

    if os.platform() == 'win32'
        wxw 'raise' 'kachel.exe'
    else
        for win in kacheln()
            if win.isVisible()
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
                               
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   

wins      = -> BrowserWindow.getAllWindows()
kacheln   = -> wins().filter (w) -> w.id != swtch?.id and w.isVisible()
activeWin = -> BrowserWindow.getFocusedWindow()
winWithId = (id) -> BrowserWindow.fromId id
