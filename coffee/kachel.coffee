###
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000    
###

{ drag, post, scheme, stopEvent, prefs, slash, klog, kstr, elem, win, os, $ } = require 'kxk'

kachelSizes = [72,108,144,216]

class Kachel extends win

    @: (@kachelId:'kachel') ->
        
        super
            prefsSeperator: '▸'
            dir:    __dirname
            pkg:    require '../package.json'
            menu:   '../coffee/menu.noon'
            onLoad: @onWinLoad
    
        @main =$ '#main'
        @drag  = new drag
            target:   document.body
            onStart:  @onDragStart
            onMove:   @onDragMove
            onStop:   @onDragStop
        
        @win.on 'move'  @onWinMove
        @win.on 'blur'  @onWinBlur
        @win.on 'focus' @onWinFocus
        @win.on 'move'  @onWinMove
        @win.on 'close' @onWinClose
        
        post.on 'initData'   @onInitData
        post.on 'saveBounds' @onSaveBounds
        post.on 'combo'      @onCombo
        post.on 'hover'      @onHover
        post.on 'leave'      @onLeave
        post.on 'toggleScheme' -> scheme.toggle()
        
        if @kachelId != 'main'
            @win.setSkipTaskbar true
            prefs.set "kacheln▸#{@kachelId}" @kachelData()
        
        post.toMain 'kachelBounds' @id, @kachelId
                                
    kachelData: -> html:@kachelId
      
    kachelSize: ->
        size = 0        
        while kachelSizes[size] < @win.getBounds().width
            size++
        size
    
    onContextMenu: (event) => stopEvent event 
    
    # 0000000    00000000    0000000    0000000   
    # 000   000  000   000  000   000  000        
    # 000   000  0000000    000000000  000  0000  
    # 000   000  000   000  000   000  000   000  
    # 0000000    000   000  000   000   0000000   
    
    onDragStart: (drag, event) => 
    
        @startBounds = @win.getBounds()
        post.toMain 'dragStart' @id
        
    onDragMove: (drag, event) => 
        
        @win.setPosition @startBounds.x + drag.deltaSum.x, @startBounds.y + drag.deltaSum.y
        @win.setSize     @startBounds.width, @startBounds.height
        
    onDragStop: (drag, event) =>
        
        post.toMain 'dragStop' @id
        if not drag.deltaSum? or drag.deltaSum.x == 0 == drag.deltaSum.y
            if event.button == 0
                @onClick event
        else
            post.toMain 'snapKachel' @id
    
    onSaveBounds: =>
        
        for i in [1..4]
            document.body.classList.remove "kachelSize#{i}"
        document.body.classList.add    "kachelSize#{@kachelSize()+1}"
        
        prefs.set "bounds▸#{@kachelId}" @win.getBounds()
        @onBounds()
        
    onHover: (event) => document.body.classList.add 'kachelFocus'
    onLeave: (event) => document.body.classList.remove 'kachelFocus'
        
    onWinFocus:  (event) => document.body.classList.add    'kachelFocus'; post.toMain 'kachelFocus' @id; @onFocus event
    onWinBlur:   (event) => document.body.classList.remove 'kachelFocus'; @onBlur  event
    onWinLoad:   (event) => @onLoad event
    onWinMove:   (event) => @onMove event
                
    onWinClose:  (event) => 
        if @kachelId != 'main'
            prefs.del "kacheln▸#{@kachelId}" 
        @onClose event
        
    onInitData: =>
              
        post.toMain 'kachelBounds' @id, @kachelId
    
    onLoad:   -> # to be overridden in subclasses
    onMove:   -> # to be overridden in subclasses
    onClick:  -> # to be overridden in subclasses
    onFocus:  -> # to be overridden in subclasses
    onBlur:   -> # to be overridden in subclasses
    onMove:   -> # to be overridden in subclasses
    onClose:  -> # to be overridden in subclasses
    onBounds: -> # to be overridden in subclasses
        
    # 00     00  00000000  000   000  000   000
    # 000   000  000       0000  000  000   000
    # 000000000  0000000   000 0 000  000   000
    # 000 0 000  000       000  0000  000   000
    # 000   000  00000000  000   000   0000000 
    
    onMenuAction: (action) =>
        switch action
            when 'New'          then post.toMain 'newKachel' {}
            when 'Close'        then @win.close()
            when 'Quit'         then post.toMain 'quit'
            when 'About'        then post.toMain 'showAbout'
            when 'Scheme'       then post.toWins 'toggleScheme'
            when 'IncreaseSize' then post.toMain 'kachelSize' 'increase'
            when 'DecreaseSize' then post.toMain 'kachelSize' 'decrease'
            when 'ResetSize'    then post.toMain 'kachelSize' 'reset'
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
            when 'left''right''up''down' then post.toMain 'focusKachel' @id, combo
            when 'enter''space' then @onClick()
            
module.exports = Kachel
