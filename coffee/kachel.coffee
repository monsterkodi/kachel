###
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000    
###

{ post, scheme, prefs, elem, win, $, _ } = require 'kxk'

class Kachel extends win

    @: (@kachelId:) ->
        
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
        
        post.on 'combo' @onCombo
        post.on 'toggleScheme' -> scheme.toggle()
        
        if @kachelId != 'main'
            prefs.set "kacheln:#{@kachelId}" @kachelData()
        
        bounds = prefs.get "bounds:#{@kachelId}"
        if bounds?
            @win.setPosition bounds.x, bounds.y 
    
    kachelData: -> html:@kachelId
            
    onMouseDown: (event) => @moved = false
    onMouseUp:   (event) => if not @moved then @onClick()
    onWinMove:   (event) => @moved = true; @onMove event
    onWinFocus:  (event) => document.body.classList.add    'kachelFocus'; @main.classList.add    'kachelFocus'; @onFocus event
    onWinBlur:   (event) => document.body.classList.remove 'kachelFocus'; @main.classList.remove 'kachelFocus'; @onBlur  event
    onWinMove:   (event) => prefs.set "bounds:#{@kachelId}", @win.getBounds(); log prefs.get "bounds:#{@kachelId}"; @onMove event
    onWinLoad:   (event) => prefs.set "bounds:#{@kachelId}", @win.getBounds(); @onLoad  event
    onWinClose:  (event) => 
        if @kachelId != 'main'
            prefs.del "kacheln:#{@kachelId}" 
        @onClose event
    
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
            when 'New'    then post.toMain 'newKachel', {}
            when 'Close'  then @win.close()
            when 'Quit'   then post.toMain 'quit'
            when 'Scheme' then post.toWins 'toggleScheme'
            
    #  0000000   0000000   00     00  0000000     0000000   
    # 000       000   000  000   000  000   000  000   000  
    # 000       000   000  000000000  0000000    000   000  
    # 000       000   000  000 0 000  000   000  000   000  
    #  0000000   0000000   000   000  0000000     0000000   
    
    onCombo: (combo, info) ->
                
        switch combo
            when 'left''right''up''down' then post.toMain 'focusKachel', @id, combo
            
module.exports = Kachel
