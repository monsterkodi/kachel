###
000   000   0000000    0000000  000   000  00000000  000       0000000  00000000  000000000
000  000   000   000  000       000   000  000       000      000       000          000   
0000000    000000000  000       000000000  0000000   000      0000000   0000000      000   
000  000   000   000  000       000   000  000       000           000  000          000   
000   000  000   000   0000000  000   000  00000000  0000000  0000000   00000000     000   
###

{ empty, klog, post, prefs, slash, valid, win } = require 'kxk'

Bounds   = require './bounds'
electron = require 'electron'

class KachelSet

    @: (mainId) ->
        
        @switching   = false
        
        @focusKachel = null
        @hoverKachel = null
        
        @dict  = "#{mainId}": 'main'
        @wids  = main:mainId
        @set   = []
        
        post.on 'kachelLoad'  @onKachelLoad
        post.on 'restoreSet'  @onRestoreSet
        post.on 'storeSet'    @onStoreSet
        post.on 'kachelFocus' @onKachelFocus
        post.on 'newKachel'   @onNewKachel
            
    # 000   000  00000000  000   000        000   000   0000000    0000000  000   000  00000000  000      
    # 0000  000  000       000 0 000        000  000   000   000  000       000   000  000       000      
    # 000 0 000  0000000   000000000        0000000    000000000  000       000000000  0000000   000      
    # 000  0000  000       000   000        000  000   000   000  000       000   000  000       000      
    # 000   000  00000000  00     00        000   000  000   000   0000000  000   000  00000000  0000000  

    onNewKachel: (kachelId) =>

        return if kachelId == 'main'
        
        if @wids[kachelId]
            
            win = @win kachelId
            
            if kachelId == 'default'
                win.close()
                return
            
            win.show()
            
            if kachelId not in @set
                @set.push kachelId 
                prefs.set "kacheln" @set
                prefs.save()
            
            return
        
        kachelSize = 2
    
        type = kachelId
        if kachelId.startsWith 'start'
            type = 'start'
            kachelSize = 2
        else if kachelId.endsWith('.app') or kachelId.endsWith('.exe')
            if slash.base(kachelId) == 'konrad'
                type = 'konrad'
                kachelSize = 4
            else
                type = 'appl'
                kachelSize = 2
        else if kachelId.startsWith('/') or kachelId[1] == ':'
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
            webPreferences: 
                nodeIntegration:        true
                backgroundThrottling:   false
            
        win.loadURL KachelSet.html(type), baseURLForDataURL:"file://#{__dirname}/../js/index.html"
        
        win.kachelId = kachelId
        
        win.webContents.on 'dom-ready' ((id) -> (event) ->
            wid = event.sender.id
            post.toWin wid, 'initKachel' id
            electron.BrowserWindow.fromId(wid)?.show()
            Bounds.update()
            )(kachelId)
              
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
    
        if @dict[winId] != 'main'
            @focusKachel = electron.BrowserWindow.fromId winId

    # 000   000  00000000  000   000  
    # 0000  000  000       000 0 000  
    # 000 0 000  0000000   000000000  
    # 000  0000  000       000   000  
    # 000   000  00000000  00     00  
    
    onRestoreSet: =>

        @load '_save'

    onStoreSet: =>

        prefs.set "kacheln_save" @set
        prefs.save()
        
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    load: (postfix='') ->
                
        return if @switching
            
        @switching = true
        
        if empty postfix
            oldKacheln = prefs.get "kacheln" []

        @kachelIds = []
        updateIds = ['main']
        showIds = []
        newSet = prefs.get "kacheln#{postfix}" []

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
        
        if empty postfix
            prefs.set "kacheln" oldKacheln
                    
        @set = newSet
        
        if valid postfix
            prefs.set "kacheln" @set
        
        for kachelId in updateIds
            post.emit 'updateBounds' kachelId

        for kachelId in showIds
            @onNewKachel kachelId
         
        @didLoad()
            
    # 0000000    000  0000000          000       0000000    0000000   0000000    
    # 000   000  000  000   000        000      000   000  000   000  000   000  
    # 000   000  000  000   000        000      000   000  000000000  000   000  
    # 000   000  000  000   000        000      000   000  000   000  000   000  
    # 0000000    000  0000000          0000000   0000000   000   000  0000000    
    
    didLoad: =>
        
        @switching = false
        @win('main').focus()
        @focusKachel = @win('main')
        post.emit 'setLoaded'
           
    # 000   000   0000000    0000000  000   000  00000000  000              000       0000000    0000000   0000000    
    # 000  000   000   000  000       000   000  000       000              000      000   000  000   000  000   000  
    # 0000000    000000000  000       000000000  0000000   000              000      000   000  000000000  000   000  
    # 000  000   000   000  000       000   000  000       000              000      000   000  000   000  000   000  
    # 000   000  000   000   0000000  000   000  00000000  0000000          0000000   0000000   000   000  0000000    
    
    onKachelLoad: (wid, kachelId) =>
            
        if kachelId not in @set
            @set.push kachelId 
            prefs.set "kacheln" @set
            prefs.save()
        
        @dict[wid] = kachelId
        @wids[kachelId] = wid
        
        if @kachelIds
            index = @kachelIds.indexOf kachelId
            if index >= 0
                @kachelIds.splice index, 1
                if @kachelIds.length == 0 then @didLoad()
  
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
            prefs.set "kacheln" @set
                
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
