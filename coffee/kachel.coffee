###
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000    
###

{ post, scheme, prefs, slash, klog, elem, win, $ } = require 'kxk'

class Kachel extends win

    @: (@kachelId:'kachel') ->
        
        super
            dir:    __dirname
            pkg:    require '../package.json'
            menu:   '../coffee/menu.noon'
            onLoad: @onWinLoad
    
        @main =$ '#main'
        @moved = false
        
        @win.on 'move'  @onWinMove
        @win.on 'blur'  @onWinBlur
        @win.on 'focus' @onWinFocus
        @win.on 'move'  @onWinMove
        @win.on 'close' @onWinClose
                
        @main.addEventListener 'mousedown' @onMouseDown
        @main.addEventListener 'mouseup'   @onMouseUp
        
        post.on 'initData'   @onInitData
        post.on 'saveBounds' @onSaveBounds
        post.on 'combo' @onCombo
        post.on 'toggleScheme' -> scheme.toggle()
        
        if @kachelId != 'main'
            @win.setSkipTaskbar true
            prefs.set "kacheln:#{@kachelId}" @kachelData()
        
        bounds = prefs.get "bounds:#{@kachelId}"
        if bounds?
            @win.setBounds bounds
    
    kachelData: -> html:@kachelId
      
    onSaveBounds: => 
        # klog "#{@kachelId}", @win.getBounds().x 
        prefs.set "bounds:#{@kachelId}" @win.getBounds()
    onMouseDown: (event) => @moved = false
    onWinFocus:  (event) => document.body.classList.add    'kachelFocus'; @main.classList.add    'kachelFocus'; @onFocus event
    onWinBlur:   (event) => document.body.classList.remove 'kachelFocus'; @main.classList.remove 'kachelFocus'; @onBlur  event
    onWinMove:   (event) => @moved = true;   @onMove event
    onWinLoad:   (event) => @onSaveBounds(); @onLoad event
    onMouseUp:   (event) => 
        if not @moved 
            @onClick event
        else 
            post.toMain 'snapKachel' @id
            
    onWinClose:  (event) => 
        if @kachelId != 'main'
            prefs.del "kacheln:#{@kachelId}" 
        @onClose event
        
    onInitData: =>
                
        bounds = prefs.get "bounds:#{@kachelId}"
        if bounds?
            @win.setBounds bounds
    
    onLoad:  -> # to be overridden in subclasses
    onMove:  -> # to be overridden in subclasses
    onClick: -> # to be overridden in subclasses
    onFocus: -> # to be overridden in subclasses
    onBlur:  -> # to be overridden in subclasses
    onMove:  -> # to be overridden in subclasses
    onClose: -> # to be overridden in subclasses
        
    # 00     00  00000000  000   000  000   000
    # 000   000  000       0000  000  000   000
    # 000000000  0000000   000 0 000  000   000
    # 000 0 000  000       000  0000  000   000
    # 000   000  00000000  000   000   0000000 
    
    onMenuAction: (action) =>
        switch action
            when 'New'          then post.toMain 'newKachel', {}
            when 'Close'        then @win.close()
            when 'Quit'         then post.toMain 'quit'
            when 'Scheme'       then post.toWins 'toggleScheme'
            when 'Arrange'      then post.toMain 'arrange'
            when 'IncreaseSize' then post.toMain 'kachelSize' 'increase'
            when 'DecreaseSize' then post.toMain 'kachelSize' 'decrease'
            when 'ResetSize'    then post.toMain 'kachelSize' 'reset'
            when 'Increase'     then post.toMain 'kachelSize' 'increase' @id
            when 'Decrease'     then post.toMain 'kachelSize' 'decrease' @id
            when 'Reset'        then post.toMain 'kachelSize' 'reset'    @id
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
