###
 0000000   000       0000000   00000000   00     00    
000   000  000      000   000  000   000  000   000    
000000000  000      000000000  0000000    000000000    
000   000  000      000   000  000   000  000 0 000    
000   000  0000000  000   000  000   000  000   000    
###

{ elem, klog, kstr, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Alarm extends Kachel
        
    @: (@kachelId:'alarm') -> super
    
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    onLoad: ->
        
        @hour   = elem class:'alarm-hour' 
        @minute = elem class:'alarm-minute'
        @second = elem class:'alarm-second'
             
        @main.appendChild elem class:'alarm-digits' children: [@hour, @minute, @second]
        
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
        
        @hour  .innerHTML = kstr.lpad hours,   2 '0'
        @minute.innerHTML = kstr.lpad minutes, 2 '0'
        @second.innerHTML = kstr.lpad seconds, 2 '0'
        
module.exports = Alarm
