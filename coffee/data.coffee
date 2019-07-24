###
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
###

{ post, klog, kstr, _ } = require 'kxk'

ioHook  = require 'iohook'
sysinfo = require 'systeminformation'

class Data

    @: ->

        ioHook.start()
        
        @providers = 
            mouse:    new Mouse
            keyboard: new Keyboard
        
        post.on 'requestData' @onRequestData
        
        setInterval @slowTick, 1000
                        
    onRequestData: (provider, wid) =>
            
        if not @providers[provider]
            @providers[provider] = new {clock:Clock, sysinfo:Sysinfo}[provider]
            @providers[provider].receivers = []
            
        if wid not in @providers[provider].receivers
            @providers[provider].receivers.push wid 

    slowTick: =>
        
        for name,provider of @providers
            if provider.tick == 'slow'
                provider.onTick @
        
    send: (provider, data) =>
        
        for receiver in provider.receivers
            post.toWin receiver, 'data' data
            
###
 0000000  000       0000000    0000000  000   000  
000       000      000   000  000       000  000   
000       000      000   000  000       0000000    
000       000      000   000  000       000  000   
 0000000  0000000   0000000    0000000  000   000  
###

class Clock
        
    @: (@name='clock' @tick='slow') ->
        
    onTick: (data) =>
        
        time = new Date()
        
        hours   = time.getHours()
        minutes = time.getMinutes()
        seconds = time.getSeconds()
        
        hourStr   = kstr.lpad hours,   2 '0'
        minuteStr = kstr.lpad minutes, 2 '0'
        secondStr = kstr.lpad seconds, 2 '0'
        
        data.send @,
            hour:   hours
            minute: minutes
            second: seconds
            str:
                    hour:   hourStr
                    minute: minuteStr
                    second: secondStr
                    
#  0000000  000   000   0000000  000  000   000  00000000   0000000   
# 000        000 000   000       000  0000  000  000       000   000  
# 0000000     00000    0000000   000  000 0 000  000000    000   000  
#      000     000          000  000  000  0000  000       000   000  
# 0000000      000     0000000   000  000   000  000        0000000   

class Sysinfo
        
    @: (@name='sysinfo' @tick='slow') ->
        
    onTick: (data) =>
        
        sysinfo.getDynamicData (d) => data.send @, d

# 00     00   0000000   000   000   0000000  00000000  
# 000   000  000   000  000   000  000       000       
# 000000000  000   000  000   000  0000000   0000000   
# 000 0 000  000   000  000   000       000  000       
# 000   000   0000000    0000000   0000000   00000000  

class Mouse
    
    @: (@name='mouse' @receivers=[]) ->
        
        ioHook.on 'mousewheel' @onEvent
        ioHook.on 'mousemove'  @onEvent
        ioHook.on 'mousedown'  @onEvent
        ioHook.on 'mouseup'    @onEvent
        
    onEvent: (event) =>
        
        post.toMain @name, event
        for receiver in @receivers
            post.toWin receiver, @name, event
        
# 000   000  00000000  000   000  0000000     0000000    0000000   00000000   0000000    
# 000  000   000        000 000   000   000  000   000  000   000  000   000  000   000  
# 0000000    0000000     00000    0000000    000   000  000000000  0000000    000   000  
# 000  000   000          000     000   000  000   000  000   000  000   000  000   000  
# 000   000  00000000     000     0000000     0000000   000   000  000   000  0000000    

class Keyboard
    
    @: (@name='keyboard' @receivers=[]) ->
        
        ioHook.on 'keydown' @onEvent
        ioHook.on 'keyup'   @onEvent

    onEvent: (event) =>
        
        post.toMain @name, event
        for receiver in @receivers
            post.toWin receiver, @name, event
        
module.exports = Data
