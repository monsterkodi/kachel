###
 0000000  000       0000000    0000000  000   000  
000       000      000   000  000       000  000   
000       000      000   000  000       0000000    
000       000      000   000  000       000  000   
 0000000  0000000   0000000    0000000  000   000  
###

{ elem, klog, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Clock extends Kachel
        
    @: (@kachelId:'clock') -> super
    
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    onLoad: ->
        
        svg = utils.svg clss:'clock'
        @main.appendChild svg
        
        face = utils.circle radius:47 clss:'face' svg:svg
        
        for m in [0..11]
            utils.append face, 'line' class:'major' y1:45 y2:47 transform:"rotate(#{30*m*5})" 
    
        @hour   = utils.append face, 'line' y1:0 y2:-32 class:'hour' 
        @minute = utils.append face, 'line' y1:0 y2:-42 class:'minute'
        @second = utils.append face, 'line' y1:0 y2:-42 class:'second'
                            
        @onTick()
        setInterval @onTick, 1000
        
    # 000000000  000   0000000  000   000  
    #    000     000  000       000  000   
    #    000     000  000       0000000    
    #    000     000  000       000  000   
    #    000     000   0000000  000   000  
    
    onTick: =>
        
        time = new Date()
        
        hours   = time.getHours()
        minutes = time.getMinutes()
        seconds = time.getSeconds()
        
        @hour  .setAttribute 'transform' "rotate(#{30 * hours + minutes / 2})"
        @minute.setAttribute 'transform' "rotate(#{6 * minutes + seconds / 10})"
        @second.setAttribute 'transform' "rotate(#{6 * seconds})"
        
module.exports = Clock
