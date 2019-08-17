###
000   000   0000000    0000000  000   000  00000000  000       0000000  00000000  000000000
000  000   000   000  000       000   000  000       000      000       000          000   
0000000    000000000  000       000000000  0000000   000      0000000   0000000      000   
000  000   000   000  000       000   000  000       000           000  000          000   
000   000  000   000   0000000  000   000  00000000  0000000  0000000   00000000     000   
###

{ post, slash, prefs, klog } = require 'kxk'

Bounds   = require './bounds'
electron = require 'electron'

class KachelSet

    @: (mainId) ->
        
        @focusKachel = null
        @hoverKachel = null
        
        @dict  = "#{mainId}": 'main'
        @wids  = main:mainId
        @set   = []
        @sid   = ''
        
        post.on 'kachelLoad'  @onKachelLoad
        post.on 'toggleSet'   @onToggleSet
        post.on 'newSet'      @onNewSet
        post.on 'kachelFocus' @onKachelFocus
        post.on 'newKachel'   @onNewKachel
            
    # 000   000  00000000  000   000        000   000   0000000    0000000  000   000  00000000  000      
    # 0000  000  000       000 0 000        000  000   000   000  000       000   000  000       000      
    # 000 0 000  0000000   000000000        0000000    000000000  000       000000000  0000000   000      
    # 000  0000  000       000   000        000  000   000   000  000       000   000  000       000      
    # 000   000  00000000  00     00        000   000  000   000   0000000  000   000  00000000  0000000  

    onNewKachel: (id) =>

        return if id == 'main'
        
        if @wids[id]
            win = @win id
            win.showInactive()
            win.focus()
            return
        
        kachelSize = 3
    
        type = id
        if id.startsWith 'start'
            type = 'start'
            kachelSize = 2
        else if id.endsWith('.app') or id.endsWith('.exe')
            if slash.base(id) == 'konrad'
                type = 'konrad'
                kachelSize = 4
            else
                type = 'appl'
                kachelSize = 2
        else if id.startsWith('/') or id[1] == ':'
            type = 'folder'
            kachelSize = 2
            
        switch type
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
            closable:           false
            fullscreen:         false
            show:               false
            fullscreenenable:   false
            backgroundColor:    '#181818'
            width:              Bounds.kachelSizes[kachelSize]
            height:             Bounds.kachelSizes[kachelSize]
            webPreferences: 
                nodeIntegration: true
            
        win.loadURL KachelSet.html(type), baseURLForDataURL:"file://#{__dirname}/../js/index.html"
        
        win.kachelId = id
        
        win.webContents.on 'dom-ready' ((id) -> (event) ->
            wid = event.sender.id
            post.toWin wid, 'initKachel' id
            electron.BrowserWindow.fromId(wid).show()
            Bounds.update()
            )(id)
              
        win.on 'close' @onKachelClose
        win.setHasShadow false    
                
        win
        
    #  0000000  000       0000000    0000000  00000000  
    # 000       000      000   000  000       000       
    # 000       000      000   000  0000000   0000000   
    # 000       000      000   000       000  000       
    #  0000000  0000000   0000000   0000000   00000000  
    
    onKachelClose: (event) =>
            
        kachel = event.sender
                
        if @hoverKachel == kachel.id
            @hoverKachel = null
            
        Bounds.remove kachel
        @remove kachel        
            
        setTimeout (-> post.emit 'bounds' 'dirty'), 200
        
    # 00000000   0000000    0000000  000   000   0000000  
    # 000       000   000  000       000   000  000       
    # 000000    000   000  000       000   000  0000000   
    # 000       000   000  000       000   000       000  
    # 000        0000000    0000000   0000000   0000000   
    
    onKachelFocus: (winId) =>
    
        # klog 'on focus' @dict[winId]
        if @dict[winId] != 'main'
            @focusKachel = electron.BrowserWindow.fromId winId

    # 000   000  00000000  000   000  
    # 0000  000  000       000 0 000  
    # 000 0 000  0000000   000000000  
    # 000  0000  000       000   000  
    # 000   000  00000000  00     00  
    
    onNewSet: =>
        
        sets = prefs.get 'sets' ['']
        sets.push "#{sets.length}"
        prefs.set 'sets' sets
        @load sets[-1]
        
    # 000000000   0000000    0000000    0000000   000      00000000  
    #    000     000   000  000        000        000      000       
    #    000     000   000  000  0000  000  0000  000      0000000   
    #    000     000   000  000   000  000   000  000      000       
    #    000      0000000    0000000    0000000   0000000  00000000  
    
    onToggleSet: =>
        
        sets = prefs.get 'sets' ['']
        index = Math.max 0, sets.indexOf(@sid)
        
        if index >= sets.length-1 then index = -1
        @load sets[index+1]
        
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    load: (newSid) ->
                
        newSid ?= prefs.get 'set' ''
        
        oldKacheln = prefs.get "kacheln#{@sid}" []

        @kachelIds = []
        updateIds = ['main']
        showIds = []
        newSet = prefs.get "kacheln#{newSid}" []

        for kachelId in newSet ? []
            if kachelId != 'main'
                if @set.indexOf(kachelId) >= 0
                    updateIds.push kachelId
                    @set.splice @set.indexOf(kachelId), 1
                else
                    showIds.push kachelId
                    if not @wids[kachelId]
                        @kachelIds.push kachelId

        if @set.length
            for kachelId in @set.slice()
                if kachelId not in ['main' 'null' null]
                    if @wids[kachelId]
                        @win(kachelId).hide()
                    else
                        klog 'no wid for' kachelId
        
        prefs.set "kacheln#{@sid}" oldKacheln
                    
        @sid = newSid
        prefs.set 'set' @sid
                    
        @set = newSet
        
        for kachelId in updateIds
            post.emit 'updateBounds' kachelId

        for kachelId in showIds
            post.emit 'newKachel' kachelId
            
        if @kachelIds.length == 0
            # klog 'loaded ++ focus main'
            @win('main').focus()
            post.emit 'setLoaded'
           
    #  0000000   000   000         000       0000000    0000000   0000000    
    # 000   000  0000  000         000      000   000  000   000  000   000  
    # 000   000  000 0 000         000      000   000  000000000  000   000  
    # 000   000  000  0000         000      000   000  000   000  000   000  
    #  0000000   000   000         0000000   0000000   000   000  0000000    
    
    onKachelLoad: (wid, kachelId) =>
        
        if kachelId not in @set
            @set.push kachelId 
            prefs.set "kacheln#{@sid}" @set
        
        @dict[wid] = kachelId
        @wids[kachelId] = wid
        
        if @kachelIds
            index = @kachelIds.indexOf kachelId
            if index >= 0
                @kachelIds.splice index, 1
                if @kachelIds.length == 0
                    # klog 'set loaded -- focus main'
                    @win('main').focus()
                    post.emit 'setLoaded'
            else
                klog 'unknown kachel?' kachelId

    # 00000000   00000000  00     00   0000000   000   000  00000000  
    # 000   000  000       000   000  000   000  000   000  000       
    # 0000000    0000000   000000000  000   000   000 000   0000000   
    # 000   000  000       000 0 000  000   000     000     000       
    # 000   000  00000000  000   000   0000000       0      00000000  
    
    remove: (kachel) ->
        
        if @focusKachel == kachel
            @focusKachel = null
        
        if kachelId = @dict[kachel.id]
            if @set.indexOf(kachelId) >= 0
                @set.splice @set.indexOf(kachelId), 1
            delete @wids[kachelId]
            delete @dict[kachel.id]
            # klog "prefs remove from #{@sid}" kachelId
            prefs.set "kacheln#{@sid}" @set
                
    win: (kachelId) ->
            
        electron.BrowserWindow.fromId @wids[kachelId]
        
    # 000   000  000000000  00     00  000      
    # 000   000     000     000   000  000      
    # 000000000     000     000000000  000      
    # 000   000     000     000 0 000  000      
    # 000   000     000     000   000  0000000  
    
    @html: (type) ->
        
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
                Kachel = require("./#{type}.js");
                new Kachel({});
              </script>
            </html>
        """
        
        "data:text/html;charset=utf-8," + encodeURI html
        
module.exports = KachelSet
