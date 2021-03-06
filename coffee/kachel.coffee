###
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000    
###

{ $, _, drag, elem, klog, post, prefs, scheme, slash, stopEvent, win } = require 'kxk'

Bounds = require './bounds'

class Kachel extends win

    @: (@kachelId:'kachel') -> 
        _
        super
            prefsSeperator: '▸'
            dir:    __dirname
            pkg:    require '../package.json'
            menu:   '../coffee/menu.noon'
            onLoad: @onWinLoad
    
        @main =$ '#main'
        
        @drag = new drag
            target:   document.body
            onStart:  @onDragStart
            onMove:   @onDragMove
            onStop:   @onDragStop
        
        @win.on 'show'  @onWinShow
        @win.on 'move'  @onWinMove
        @win.on 'blur'  @onWinBlur
        @win.on 'focus' @onWinFocus
        @win.on 'move'  @onWinMove
        @win.on 'close' @onWinClose
        
        post.on 'initKachel' @onInitKachel
        post.on 'saveBounds' @onSaveBounds
        post.on 'combo'      @onCombo
        post.on 'hover'      @onHover
        post.on 'leave'      @onLeave
        post.on 'toggleScheme' -> scheme.toggle()
        
        if @kachelId != 'main'
            @win.setSkipTaskbar true
        
        post.toMain 'kachelBounds' @id, @kachelId
        
        # if os.platform() == 'darwin'
            # if parseInt(os.release().split('.')[0]) >= 18
                # document.body.classList.add 'mojave'
         
    # 00000000   00000000   0000000   000   000  00000000   0000000  000000000
    # 000   000  000       000   000  000   000  000       000          000   
    # 0000000    0000000   000 00 00  000   000  0000000   0000000      000   
    # 000   000  000       000 0000   000   000  000            000     000   
    # 000   000  00000000   00000 00   0000000   00000000  0000000      000   
    
    requestData: (name) ->
        
        post.toMain 'requestData' name, @id
        post.on 'data' @onData
                
    kachelSize: -> Bounds.kachelSize @win
            
    onContextMenu: (event) => stopEvent event 
    
    # 0000000    00000000    0000000    0000000   
    # 000   000  000   000  000   000  000        
    # 000   000  0000000    000000000  000  0000  
    # 000   000  000   000  000   000  000   000  
    # 0000000    000   000  000   000   0000000   
    
    onDragStart: (drag, event) =>
    
        if @win?.isDestroyed()
            return
            
        @startBounds = @win.getBounds()
        post.toMain 'dragStart' @id
        
    onDragMove: (drag, event) =>
        
        @win.setPosition @startBounds.x + drag.deltaSum.x, @startBounds.y + drag.deltaSum.y
        @win.setSize     @startBounds.width, @startBounds.height
        
    onDragStop: (drag, event) =>

        if Math.abs(drag.deltaSum.x) < 10 and Math.abs(drag.deltaSum.y) < 10
            @win.setBounds @startBounds
            if event.button == 0
                @onLeftClick event
            else if event.button == 1
                @onMiddleClick event
            else if event.button == 2
                @onRightClick event
        else
            if @kachelId not in ['apps']
                post.toMain 'snapKachel' @id                
        post.toMain 'dragStop' @id
    
    # 0000000     0000000   000   000  000   000  0000000     0000000  
    # 000   000  000   000  000   000  0000  000  000   000  000       
    # 0000000    000   000  000   000  000 0 000  000   000  0000000   
    # 000   000  000   000  000   000  000  0000  000   000       000  
    # 0000000     0000000    0000000   000   000  0000000    0000000   
    
    onSaveBounds: =>
        # klog 'onSaveBounds' @id
        for i in [1..6]
            document.body.classList.remove "kachelSize#{i}"
        document.body.classList.add "kachelSize#{@kachelSize()+1}"
        setId = prefs.get 'set' ''
        prefs.set "bounds#{setId}▸#{@kachelId}" @win.getBounds()
        @onBounds()
                
    #  0000000  000   000   0000000   00000000    0000000  000  0000000  00000000  
    # 000       0000  000  000   000  000   000  000       000     000   000       
    # 0000000   000 0 000  000000000  00000000   0000000   000    000    0000000   
    #      000  000  0000  000   000  000             000  000   000     000       
    # 0000000   000   000  000   000  000        0000000   000  0000000  00000000  
    
    snapSize: =>
        
        br = @win.getBounds()
        
        sizes = Bounds.snapSizes
        
        for i in [0...sizes.length-1]
            if br.width < sizes[i] + (sizes[i+1] - sizes[i]) / 2
                br.width = sizes[i]
                break
        br.width = Math.min br.width, sizes[-1]
                
        for i in [0...sizes.length-1]
            if br.height < sizes[i] + (sizes[i+1] - sizes[i]) / 2
                br.height = sizes[i]
                break
        br.height = Math.min br.height, sizes[-1]
        
        @win.setBounds br
        @onSaveBounds()
    
    # 000   0000000   0000000   000   000  
    # 000  000       000   000  0000  000  
    # 000  000       000   000  000 0 000  
    # 000  000       000   000  000  0000  
    # 000   0000000   0000000   000   000  
    
    setIcon: (iconPath, clss='applicon') =>
        
        return if not iconPath
        img = elem 'img' class:clss, src:slash.fileUrl slash.path iconPath
        img.ondragstart = -> false
        @main.innerHTML = ''
        @main.appendChild img

    # 00000000  000   000  00000000  000   000  000000000  
    # 000       000   000  000       0000  000     000     
    # 0000000    000 000   0000000   000 0 000     000     
    # 000          000     000       000  0000     000     
    # 00000000      0      00000000  000   000     000     
    
    onHover: (event) => document.body.classList.add 'kachelHover'
    onLeave: (event) => document.body.classList.remove 'kachelHover'
        
    onWinFocus: (event) => document.body.classList.add    'kachelFocus'; post.toMain 'kachelFocus' @id; @onFocus event
    onWinBlur:  (event) => document.body.classList.remove 'kachelFocus'; @onBlur  event
    onWinLoad:  (event) => @onLoad event
    onWinShow:  (event) => @onShow event
    onWinMove:  (event) => @onMove event
    onWinClose: (event) => @onClose event
        
    onInitKachel: (@kachelId) =>
           
        @win.setTitle "kachel #{@kachelId}"
                
        post.toMain 'kachelBounds' @id, @kachelId
        post.toMain 'kachelLoad' @id, @kachelId
    
    onLoad:        -> # to be overridden in subclasses
    onShow:        -> # to be overridden in subclasses
    onMove:        -> # to be overridden in subclasses
    onFocus:       -> # to be overridden in subclasses
    onBlur:        -> # to be overridden in subclasses
    onMove:        -> # to be overridden in subclasses
    onClose:       -> # to be overridden in subclasses
    onBounds:      -> # to be overridden in subclasses
    onLeftClick:   -> # to be overridden in subclasses
    onMiddleClick: -> # to be overridden in subclasses
    onRightClick:  -> # to be overridden in subclasses
        
        
    # 00     00  00000000  000   000  000   000
    # 000   000  000       0000  000  000   000
    # 000000000  0000000   000 0 000  000   000
    # 000 0 000  000       000  0000  000   000
    # 000   000  00000000  000   000   0000000 
    
    onMenuAction: (action) =>
        
        switch action
            when 'New'          then post.toMain 'newKachel' 'default'
            when 'Restore'      then post.toMain 'restoreSet'
            when 'Store'        then post.toMain 'storeSet'
            when 'Close'        then @win.close()
            when 'Quit'         then post.toMain 'quit'
            when 'Hide'         then post.toMain 'hide'
            when 'About'        then post.toMain 'showAbout'
            when 'Scheme'       then post.toWins 'toggleScheme'
            when 'Increase'     then post.toMain 'kachelSize' 'increase' @id
            when 'Decrease'     then post.toMain 'kachelSize' 'decrease' @id
            when 'Reset'        then post.toMain 'kachelSize' 'reset'    @id
            when 'MoveUp'       then post.toMain 'kachelMove' 'up'       @id
            when 'MoveDown'     then post.toMain 'kachelMove' 'down'     @id
            when 'MoveLeft'     then post.toMain 'kachelMove' 'left'     @id
            when 'MoveRight'    then post.toMain 'kachelMove' 'right'    @id
            when 'DevTools'     then @win.webContents.toggleDevTools()
            when 'Reload'       then @win.webContents.reloadIgnoringCache()
            when 'Screenshot'   then @screenshot()
            else
                klog 'action' action
            
    #  0000000   0000000   00     00  0000000     0000000   
    # 000       000   000  000   000  000   000  000   000  
    # 000       000   000  000000000  0000000    000   000  
    # 000       000   000  000 0 000  000   000  000   000  
    #  0000000   0000000   000   000  0000000     0000000   
    
    onCombo: (combo, info) =>
                
        switch combo
            when 'left''right''up''down' then post.toMain 'focusNeighbor' @id, combo
            when 'enter''space' then @onLeftClick()
            when 'command+enter''command+space''ctrl+enter''ctrl+space' then @onRightClick()
            when 'alt+command+enter''alt+command+space''alt+ctrl+enter''alt+ctrl+space' then @onMiddleClick()
            
module.exports = Kachel
