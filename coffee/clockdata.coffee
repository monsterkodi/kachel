###
 0000000  000       0000000    0000000  000   000  0000000     0000000   000000000   0000000   
000       000      000   000  000       000  000   000   000  000   000     000     000   000  
000       000      000   000  000       0000000    000   000  000000000     000     000000000  
000       000      000   000  000       000  000   000   000  000   000     000     000   000  
 0000000  0000000   0000000    0000000  000   000  0000000    000   000     000     000   000  
###

{ post, klog, kstr, _ } = require 'kxk'

class Clockdata
        
    @: ->
        info = => 
            time = new Date()
            
            hours   = time.getHours()
            minutes = time.getMinutes()
            seconds = time.getSeconds()
            
            hourStr   = kstr.lpad hours,   2 '0'
            minuteStr = kstr.lpad minutes, 2 '0'
            secondStr = kstr.lpad seconds, 2 '0'
            
            @setData 
                hour:   hours
                minute: minutes
                second: seconds
                str:
                        hour:   hourStr
                        minute: minuteStr
                        second: secondStr
            
        setInterval info, 1000
        @receivers = []

    addReceiver: (wid) -> @receivers.push wid
        
    setData: (@data) =>
        
        for receiver in @receivers
            post.toWin receiver, 'data' @data
        
    getData: -> @data
        
module.exports = Clockdata
