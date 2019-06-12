###
000   000   0000000    0000000  000   000  00000000  000        
000  000   000   000  000       000   000  000       000        
0000000    000000000  000       000000000  0000000   000        
000  000   000   000  000       000   000  000       000        
000   000  000   000   0000000  000   000  00000000  0000000    
###

{ post, elem, win, $, _ } = require 'kxk'

class Kachel extends win

    @: ->
        
        super
            dir:    __dirname
            pkg:    require '../package.json'
            menu:   '../coffee/menu.noon'
            onLoad: @onWinLoad
    
        @main =$ '#main'
        @moved = false
        
        @win.on 'move' @onWinMove
        
        @main.addEventListener 'mousedown' @onMouseDown
        @main.addEventListener 'mouseup'   @onMouseUp
    
    onMouseDown: (event) => @moved = false
    onMouseUp:   (event) => if not @moved then @onClick()
    onWinMove:   (event) => @moved = true; @onMove event
    onWinLoad:   (event) => @onLoad event
    
    onLoad:  -> # to be overridden in subclasses
    onMove:  -> # to be overridden in subclasses
    onClick: -> # to be overridden in subclasses
        
    # 00     00  00000000  000   000  000   000
    # 000   000  000       0000  000  000   000
    # 000000000  0000000   000 0 000  000   000
    # 000 0 000  000       000  0000  000   000
    # 000   000  00000000  000   000   0000000 
    
    onMenuAction: (action) =>
        
        switch action
            when 'New'   then post.toMain 'newKachel'
            when 'Close' then @win.close()
            
module.exports = Kachel
