###
000   000   0000000   000      000   000  00     00  00000000  
000   000  000   000  000      000   000  000   000  000       
 000 000   000   000  000      000   000  000000000  0000000   
   000     000   000  000      000   000  000 0 000  000       
    0       0000000   0000000   0000000   000   000  00000000  
###

{ post, clamp, kpos, elem, klog, os, _ } = require 'kxk'

wxw     = require 'wxw'
utils   = require './utils'
Kachel  = require './kachel'

class Volume extends Kachel
        
    @: (@kachelId:'volume') -> 
    
        super
        
        @mute = false
        @main.addEventListener 'mousewheel' @onWheel
    
        @volume = parseInt wxw('volume').trim()
            
    onClick: (event) =>
        
        br  = document.body.getBoundingClientRect()
        ctr = kpos(br.width, br.height).times 0.5
        vec = ctr.to kpos event
        rot = vec.normal().rotation kpos(0,-1)
        @setVolume 50 + rot / 3
        @updateVolume()
        
    onWheel: (event) => 
        
        return if event.deltaY == 0
        if event.deltaY > 0 then delta = 2 else delta = -3
        
        @volume = clamp 0 100 @volume - delta
        @mute = false
        @setVolume @volume
        @updateVolume()
    
    setVolume: (v) ->
        
        wxw 'volume' clamp 0 100 v
        @volume = parseInt wxw('volume').trim()
        
    onContextMenu: (event) => 
        
        current = parseInt wxw('volume').trim()
        klog 'current' current, @volume
        if @volume == current
            klog 'mute'
            @mute = true
            wxw 'volume' 0
        else
            @mute = false
            @setVolume @volume
            
        @updateVolume()
                
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
