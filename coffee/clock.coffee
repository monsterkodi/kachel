###
 0000000  000       0000000    0000000  000   000  
000       000      000   000  000       000  000   
000       000      000   000  000       0000000    
000       000      000   000  000       000  000   
 0000000  0000000   0000000    0000000  000   000  
###

{ post, elem, klog, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Clock extends Kachel
        
    @: (@kachelId:'clock') -> 
    
        super
        
        post.toMain 'requestData' 'clock' @id
        post.on 'data' @onData
    
    onData: (data) => 
        
        return if not @hour
        
        @hour  .setAttribute 'transform' "rotate(#{30 * data.hour + data.minute / 2})"
        @minute.setAttribute 'transform' "rotate(#{6 * data.minute + data.second / 10})"
        @second.setAttribute 'transform' "rotate(#{6 * data.second})"
        
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
                            
module.exports = Clock
