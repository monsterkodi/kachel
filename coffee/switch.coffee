###
 0000000  000   000  000  000000000   0000000  000   000  
000       000 0 000  000     000     000       000   000  
0000000   000000000  000     000     000       000000000  
     000  000   000  000     000     000       000   000  
0000000   00     00  000     000      0000000  000   000  
###

{ childp, post, stopEvent, karg, slash, drag, elem, prefs, clamp, kpos, empty, valid, last, klog, kerror, keyinfo, os, $ } = require 'kxk'

wxw      = require 'wxw'
electron = require 'electron'
appIcon  = require './icon'

startMouse = kpos 0 0

#  0000000   00000000  000000000        0000000   00000000   00000000    0000000  
# 000        000          000          000   000  000   000  000   000  000       
# 000  0000  0000000      000          000000000  00000000   00000000   0000000   
# 000   000  000          000          000   000  000        000             000  
#  0000000   00000000     000          000   000  000        000        0000000   

apps = []
getApps = ->

    infos = post.get 'wins'
    
    apps = []
    
    if os.platform() == 'darwin'
        infos.sort (a,b) -> 
            ai = a.index 
            if ai < 0 then ai = 9999
            bi = b.index
            if bi < 0 then bi = 9999
            ai - bi
                
    for info in infos
        continue if info.title == 'wxw-switch'
        file = slash.file info.path
        if file == 'ApplicationFrameHost.exe'
            name = last info.title.split '- '
            if name in ['Calendar' 'Mail']
                apps.push name if name not in apps
            else if info.title in ['Settings' 'Calculator' 'Microsoft Store']
                apps.push info.title
        else
            apps.push info.path if info.path not in apps
            
    for proc in wxw 'proc'
        if proc.path not in apps
            base = slash.base proc.path
            continue if base in ['kappo' 'cmd']
            continue if base.startsWith 'ServiceHub'
            if slash.fileExists pngPath proc.path
                apps.push proc.path
    # klog apps
    apps
    
# 00000000   000   000   0000000   
# 000   000  0000  000  000        
# 00000000   000 0 000  000  0000  
# 000        000  0000  000   000  
# 000        000   000   0000000   

pngPath = (appPath) -> slash.resolve slash.join slash.userData(), 'icons', slash.base(appPath) + ".png"
    
#  0000000  000000000   0000000   00000000   000000000  
# 000          000     000   000  000   000     000     
# 0000000      000     000000000  0000000       000     
#      000     000     000   000  000   000     000     
# 0000000      000     000   000  000   000     000     

winRect = (numApps) ->
    
    screen = electron.remote? and electron.remote.screen or electron.screen
    ss     = screen.getPrimaryDisplay().workAreaSize
    as     = 128
    border = 20
    width  = (as+border)*numApps+border
    height = as+border*2
    
    if width > ss.width
        width = Math.floor(ss.width / (as+border)) * (as+border) + border
    
    x:      parseInt (ss.width-width)/2
    y:      parseInt (ss.height-height)/2
    width:  width
    height: height

start = (opt={}) -> 
    
    wr = winRect 1
            
    win = new electron.BrowserWindow

        backgroundColor: '#00000000'
        transparent:     true
        preloadWindow:   true
        x:               wr.x
        y:               wr.y
        width:           wr.width
        height:          wr.height
        show:            false
        hasShadow:       false
        resizable:       false
        frame:           false
        thickFrame:      false
        fullscreen:      false
        webPreferences:
            nodeIntegration: true
            webSecurity:     false
            
    # 000   000  000000000  00     00  000      
    # 000   000     000     000   000  000      
    # 000000000     000     000000000  000      
    # 000   000     000     000 0 000  000      
    # 000   000     000     000   000  0000000  
    
    html = """
        <head>
        <title>wxw-switch</title>
        <style type="text/css">
            * {
                outline-width:  0;
            }
            
            body {
                overflow:       hidden;
                margin:         0;
            }
            .apps {
                opacity:        1;
                white-space:    nowrap;
                position:       absolute;
                left:           0px;
                top:            0px;
                bottom:         0px;
                right:          0px;
                overflow:       hidden;
                background:     rgb(16,16,16);
                border-radius:  6px;
                padding:        10px;
            }
            .app {
                display:        inline-block;
                width:          128px;
                height:         128px;
                padding:        10px;
            }            
            .app:hover {
                background:     rgb(20,20,20);
            }
            .app.highlight {
                background:     rgb(24,24,24);
            }
        </style>
        </head>
        <body>
        <div class="apps" tabindex=1></div>
        <script>
            var pth = process.resourcesPath + "/app/js/switch.js";
            if (process.resourcesPath.indexOf("node_modules\\\\electron\\\\dist\\\\resources")>=0) { pth = process.cwd() + "/js/switch.js"; }
            if (process.resourcesPath.indexOf("node_modules/electron/dist/Electron.app")>=0) { pth = process.cwd() + "/js/switch.js"; }
            console.log(pth, process.resourcesPath);
            require(pth).initWin();
        </script>
        </body>
    """

    data = "data:text/html;charset=utf-8," + encodeURI(html)
    win.loadURL data, baseURLForDataURL:slash.fileUrl __dirname + '/index.html'

    win.debug = opt.debug
        
    if opt.debug then win.webContents.openDevTools mode:'detach'
    # win.webContents.openDevTools mode:'detach'
    
    win
        
# 0000000     0000000   000   000  00000000  
# 000   000  000   000  0000  000  000       
# 000   000  000   000  000 0 000  0000000   
# 000   000  000   000  000  0000  000       
# 0000000     0000000   000   000  00000000  

done = -> electron.remote.getCurrentWindow().hide()

#  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
# 000   000  000          000     000  000   000  000   000     000     000       
# 000000000  000          000     000   000 000   000000000     000     0000000   
# 000   000  000          000     000     000     000   000     000     000       
# 000   000   0000000     000     000      0      000   000     000     00000000  

activeApp = null

activate = ->
    
    if activeApp.id
        
        if activeApp.id in ['Mail' 'Calendar']
            
            infos = wxw 'info' 'ApplicationFrameHost.exe'
            for info in infos
                if info.title.endsWith activeApp.id
                    wxw 'focus' info.id
                    return
            childp.spawn 'start', [{Mail:'outlookmail:' Calendar:'outlookcal:'}[activeApp.id]], encoding:'utf8' shell:true detached:true stdio:'inherit'            
            
        else if activeApp.id in ['Calculator' 'Settings' 'Microsoft Store']
            
            infos = wxw 'info' 'ApplicationFrameHost.exe'
            for info in infos
                if info.title == activeApp.id
                    wxw 'focus' info.id
                    return
            childp.spawn 'start', [{Calculator:'calculator:' Settings:'ms-settings:' 'Microsoft Store':'ms-windows-store:'}[activeApp.id]], encoding:'utf8' shell:true detached:true stdio:'inherit'
        else
            # klog 'wxw launch' activeApp.id
            wxw 'launch' activeApp.id
                
    done()

# 000   000  000   0000000   000   000  000      000   0000000   000   000  000000000  
# 000   000  000  000        000   000  000      000  000        000   000     000     
# 000000000  000  000  0000  000000000  000      000  000  0000  000000000     000     
# 000   000  000  000   000  000   000  000      000  000   000  000   000     000     
# 000   000  000   0000000   000   000  0000000  000   0000000   000   000     000     

highlight = (e) ->
    
    if e.id
        activeApp?.classList.remove 'highlight'
        e.classList.add 'highlight'
        activeApp = e

nextApp = -> highlight activeApp.nextSibling ? $('.apps').firstChild
prevApp = -> highlight activeApp.previousSibling ? $('.apps').lastChild

firstApp = -> highlight $('.apps').firstChild
lastApp  = -> highlight $('.apps').lastChild

#  0000000   000   000  000  000000000  
# 000   000  000   000  000     000     
# 000 00 00  000   000  000     000     
# 000 0000   000   000  000     000     
#  00000 00   0000000   000     000     

activationTimer = null

quitApp = -> 
    
    apps = getApps()
    wr   = winRect apps.length-1
    win  = electron.remote.getCurrentWindow()
    win.setBounds wr
    clearTimeout activationTimer
    klog 'wxw terminate' "\"#{activeApp.id}\""
    if valid wxw 'terminate' "\"#{activeApp.id}\""
        oldActive = activeApp
        nextApp()
        oldActive.remove()
    else
        kerror "can't quit?"
    
# 00     00   0000000   000   000   0000000  00000000  
# 000   000  000   000  000   000  000       000       
# 000000000  000   000  000   000  0000000   0000000   
# 000 0 000  000   000  000   000       000  000       
# 000   000   0000000    0000000   0000000   00000000  

onMouseMove = (event) -> 

    highlight event.target
    
onMouseDown = (event) -> 
    
    activeApp = event.target
    activate()
        
# 000   000  00000000  000   000  
# 000  000   000        000 000   
# 0000000    0000000     00000    
# 000  000   000          000     
# 000   000  00000000     000     

lastCombo = null

onKeyDown = (event) -> 
    
    { mod, key, char, combo } = keyinfo.forEvent event
    
    win = electron.remote.getCurrentWindow()
         
    lastCombo = combo
    
    switch key
        when 'right''down'      then return nextApp()
        when 'left''up'         then return prevApp()
        when 'page up''home'    then return firstApp()
        when 'page down''end'   then return lastApp()
        
    switch combo
        when 'ctrl+tab''tab'             then return nextApp()
        when 'ctrl+shift+tab''shift+tab' then return prevApp()
        # else klog 'combo' combo
        
    if not event.repeat
    
        switch key
            when 'esc'                    then return stopEvent event, done()
            when 'enter' 'return' 'space' then return activate()
        
        switch combo
            when 'ctrl+q''delete''command+q' then return stopEvent event, quitApp()
            when 'alt+ctrl+q'     then return electron.remote.app.quit()
            when 'alt+ctrl+/'     then return post.toMain 'showAbout'
            when 'alt+ctrl+i'     then return win.webContents.openDevTools()
        
onKeyUp = (event) ->        
    
    { mod, key, char, combo } = keyinfo.forEvent event
        
    # klog 'onKeyUp' combo, lastCombo, event.metaKey, event.altKey, event.ctrlKey, event.shiftKey
    
    if os.platform() == 'win32'
        
        if empty(combo) then activate()
        
    else if os.platform() == 'darwin' # mac triggers keyup on first mouse move
    
        if empty(combo) and empty(lastCombo)
        
            # modifiers = wxw('key').trim()
            activationTimer = setTimeout (->
                mousePos = post.get 'mouse'
                # klog 'mousePos' kpos(mousePos), startMouse, kpos(mousePos).distSquare startMouse
                if kpos(mousePos).distSquare(startMouse) == 0
                    if valid(lastCombo) and lastCombo not in ['command']
                        startMouse = mousePos
                        lastCombo = null
                        # klog 'comboactive' lastCombo
                        return
                    # klog 'mouse not moved! activate!'
                    activate()
                else
                    # klog 'mouse moved! skip!'
                    startMouse = mousePos
                ), 20

# 000   000  00000000  000   000  000000000   0000000   00000000   00000000   
# 0000  000  000        000 000      000     000   000  000   000  000   000  
# 000 0 000  0000000     00000       000     000000000  00000000   00000000   
# 000  0000  000        000 000      000     000   000  000        000        
# 000   000  00000000  000   000     000     000   000  000        000        

onNextApp = ->
    
    win = electron.remote.getCurrentWindow()
        
    if win.isVisible()
        nextApp()
    else
        a =$ '.apps'
        a.innerHTML = ''
        a.focus()
        
        lastCombo = null
        
        if os.platform() == 'win32'
            win.setPosition -10000,-10000 # move window offscreen before show
            win.show()
            a.focus()
            restore = -> 
                
                wr = winRect apps.length
                win.setBounds wr
                win.focus()
                a.focus()
                    
            setTimeout restore, 30 # give windows some time to do it's flickering
            loadApps()
        else
            loadApps()
            
            startMouse = post.get 'mouse'
            # klog 'onNextApp' startMouse
            
            if empty wxw('key').trim() # command key released before window was shown
                activate()
            else
                wr = winRect apps.length
                win.setBounds wr
                klog apps.length, wr.width
                setImmediate ->
                    win.show()
                    win.focus()
                    a.focus()
        
# 000  000   000  000  000000000    000   000  000  000   000  
# 000  0000  000  000     000       000 0 000  000  0000  000  
# 000  000 0 000  000     000       000000000  000  000 0 000  
# 000  000  0000  000     000       000   000  000  000  0000  
# 000  000   000  000     000       00     00  000  000   000  

initWin = ->
    
    a =$ '.apps'

    a.onmousedown = onMouseDown
    a.onkeydown   = onKeyDown
    a.onkeyup     = onKeyUp

    a.focus()
            
    win = electron.remote.getCurrentWindow()
    
    win.on 'blur' -> done()
    
    post.on 'nextApp' onNextApp
    
# 000       0000000    0000000   0000000         0000000   00000000   00000000    0000000  
# 000      000   000  000   000  000   000      000   000  000   000  000   000  000       
# 000      000   000  000000000  000   000      000000000  00000000   00000000   0000000   
# 000      000   000  000   000  000   000      000   000  000        000             000  
# 0000000   0000000   000   000  0000000        000   000  000        000        0000000   

loadApps = ->
    
    a =$ '.apps'
    a.innerHTML = ''
    
    for app in getApps()
        
        if app in ['Mail' 'Calendar' 'Calculator' 'Settings' 'Microsoft Store']
            png = slash.join __dirname, '..' 'icons' "#{app}.png"
        else
            png = pngPath app
            if not slash.fileExists png
                appIcon app, png
                if not slash.fileExists png
                    png = slash.join __dirname, '..' 'icons' 'app.png'
        
        a.appendChild elem 'img',
            id:     app
            class:  'app' 
            src:    slash.fileUrl png
        
    a.focus()
    
    if a.firstChild?
        highlight a.firstChild.nextSibling ? a.firstChild
            
module.exports = 
    start:start
    initWin:initWin
    
    
    