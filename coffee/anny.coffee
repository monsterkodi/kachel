###
 0000000   000   000  000   000  000   000  
000   000  0000  000  0000  000   000 000   
000000000  000 0 000  000 0 000    00000    
000   000  000  0000  000  0000     000     
000   000  000   000  000   000     000     
###

{ post, childp, slash, empty, valid, randint, klog, kstr, elem, open, os, fs, $, _ } = require 'kxk'

Appl    = require './appl'
Bounds  = require './bounds'
wxw     = require 'wxw'

class Anny extends Appl
        
    @: (@kachelId:'anny') -> 

        super

        @win.setResizable true
        @win.setMinimumSize Bounds.kachelSizes[0], Bounds.kachelSizes[0]
        @win.setMaximumSize Bounds.kachelSizes[-1], Bounds.kachelSizes[-1]
        @win.on 'resize' @onResize
        
        @setIcon __dirname + '/../img/anny.png', 'annyicon'
        
    onResize: (event) =>
        
        clearTimeout @snapTimer
        @snapTimer = setTimeout @snapSize, 150
               
    snapSize: =>
        
        super
        
        b = @win.getBounds()
        size = parseInt 0.8 * Math.min b.width, b.height
        
        $('.annyicon').width  = size
        $('.annyicon').height = size

        $('.annyicon').style.width  = "#{size}px"
        $('.annyicon').style.height = "#{size}px"
        
    onApp: (action, app) =>
        
        # @activated = action == 'activated'
        # @updateDot()

    onWin: (wins) =>
        
        # @status = ''
        # for w in wins
            # for c in ['maximized' 'normal']
                # if w.status.startsWith c
                    # @status = w.status
                    # break
            # if valid @status
                # break

        # if empty @status
            # for w in wins
                # if w.status == 'minimized'
                    # @status = 'minimized'
                    # break
        
        @updateDot()
                        
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onLeftClick: (event) -> 
        
        # klog 'appl.onClick' slash.file @kachelId
        
        return if not @currentApp
        if os.platform() == 'win32'
            infos = wxw 'info' slash.file @currentApp
            if infos.length
                wxw 'focus' slash.file @currentApp
            else
                open slash.unslash @currentApp
        else
            open @currentApp
    
    onContextMenu: (event) => 
        
        if @currentApp
            wxw 'minimize' slash.file @currentApp

    onMiddleClick: (event) => 
  
        if @currentApp
            wxw 'terminate' @currentApp
                    
    onInitKachel: (@kachelId) =>
                        
        @win.setTitle "kachel #{@kachelId}"
                
        post.toMain 'kachelBounds' @id, @kachelId
        post.toMain 'kachelLoad' @id, @kachelId
        
module.exports = Anny
