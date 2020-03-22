###
 0000000   000       0000000   00000000   00     00    
000   000  000      000   000  000   000  000   000    
000000000  000      000000000  0000000    000000000    
000   000  000      000   000  000   000  000 0 000    
000   000  0000000  000   000  000   000  000   000    
###

{ _, elem } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Alarm extends Kachel
        
    @: (@kachelId:'alarm') -> 
        _
        super
        
        @requestData 'clock'
        
    onData: (data) => 
        
        @hour  .innerHTML = data.str.hour
        @minute.innerHTML = data.str.minute
        @second.innerHTML = data.str.second
    
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
        
module.exports = Alarm
