###
000   000   0000000   000      000   000  00     00  00000000  
000   000  000   000  000      000   000  000   000  000       
 000 000   000   000  000      000   000  000000000  0000000   
   000     000   000  000      000   000  000 0 000  000       
    0       0000000   0000000   0000000   000   000  00000000  
###

{ post, clamp, elem, klog, os, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

if os.platform() == 'win32' then wxw = require 'wxw'

class Volume extends Kachel
        
    @: (@kachelId:'volume') -> 
    
        super
        
        @mute = false
        @main.addEventListener 'mousewheel' @onWheel
    
        if os.platform() == 'win32'
            @volume = parseInt wxw('volume').trim()
                
    onWheel: (event) => 
        
        @volume = clamp 0 100 @volume - event.deltaY/10
        @mute = false
        wxw 'volume' @volume
        @updateVolume()
    
    onContextMenu: (event) => 
        
        if os.platform() == 'win32'
            current = parseInt wxw('volume').trim()
            if @volume == current
                @mute = true
                wxw 'volume' 0
            else
                @mute = false
                wxw 'volume' @volume
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
