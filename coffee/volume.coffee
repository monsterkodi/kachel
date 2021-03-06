###
000   000   0000000   000      000   000  00     00  00000000  
000   000  000   000  000      000   000  000   000  000       
 000 000   000   000  000      000   000  000000000  0000000   
   000     000   000  000      000   000  000 0 000  000       
    0       0000000   0000000   0000000   000   000  00000000  
###

{ _, clamp, kerror, kpos } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Volume extends Kachel
        
    @: (@kachelId:'volume') -> 
        _
        # electron = require 'electron'
        # electron.remote.getCurrentWindow().openDevTools mode:'detach'
        
        super
        @mute = false
        @main.addEventListener 'mousewheel' @onWheel
    
        try
            wxw = require 'wxw'
            @volume = parseInt wxw 'volume'
        catch err
            kerror "#{err}"
            
    onLeftClick: (event) =>
        
        br  = document.body.getBoundingClientRect()
        ctr = kpos(br.width, br.height).times 0.5
        vec = ctr.to kpos event
        rot = vec.normal().rotation kpos(0,-1)
        @setVolume 50 + rot / 3
        
    onWheel: (event) => 
        
        return if event.deltaY == 0
        if event.deltaY > 0 then delta = 2 else delta = -3
        
        @volume = clamp 0 100 @volume - delta
        
        @setVolume @volume
    
    setVolume: (v) ->
        
        @mute = false
        
        wxw = require 'wxw'
        @volume = parseInt wxw 'volume' "#{parseInt clamp 0 100 v}"
        
        @updateVolume()
        
    onContextMenu: (event) => 
        
        wxw = require 'wxw'
        current = parseInt wxw 'volume'
        if @volume == current
            @mute = true
            wxw 'volume' 0
            @updateVolume()
        else
            @setVolume @volume
                
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    onLoad: ->
        
        svg = utils.svg clss:'volume'
        @main.appendChild svg
        
        face = utils.circle radius:35 clss:'knob' svg:svg
        
        for m in [1..11]
            
            utils.append face, 'line' class:'volmrk' y1:40 y2:47 transform:"rotate(#{30*m*5})" 
    
        @voldot = utils.append face, 'circle' r:5 cx:0 cy:-25 class:'voldot'
        
        @updateVolume()
        
    updateVolume: ->
        
        angle = 150*(@volume-50)/50
        @voldot.setAttribute 'transform' "rotate(#{angle})"
        @voldot.classList.toggle 'mute' @mute
                            
module.exports = Volume
