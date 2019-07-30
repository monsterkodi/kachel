###
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
###

{ post, klog, slash, kstr, udp, os, _ } = require 'kxk'

sysinfo  = require 'systeminformation'
electron = require 'electron'

if os.platform() == 'win32' then wxw = require 'wxw'

class Data

    @: ->
        
        if os.platform() == 'win32'
            
            @udp  = udp port:66666 onMsg:@onUDP
            @hook = wxw 'hook'
        
        @providers = 
            mouse:    new Mouse
            keyboard: new Keyboard
            apps:     new Apps
            wins:     new Wins
        
        post.on 'requestData' @onRequestData
        
        setTimeout @slowTick, 1000
        
    detach: ->
        
        klog 'Data.detach' @hook?, @hook?.kill('SIGKILL')
            
    onUDP: (msg) => log "udp" msg
        
    onRequestData: (provider, wid) =>
        
        # klog "Data.onRequestData provider:#{kstr provider} wid:#{kstr wid}"
            
        if not @providers[provider]
            @providers[provider] = new {clock:Clock, sysinfo:Sysinfo}[provider]
            @providers[provider].receivers = []
            
        if wid not in @providers[provider].receivers
            @providers[provider].receivers.push wid 

    slowTick: =>
        
        for name,provider of @providers
            if provider.tick == 'slow'
                provider.onTick @
                
        setTimeout @slowTick, 1000 - (new Date).getMilliseconds()
        
    send: (provider, data) =>
        
        for receiver in provider.receivers
            post.toWin receiver, 'data' data
            
#  0000000  000       0000000    0000000  000   000  
# 000       000      000   000  000       000  000   
# 000       000      000   000  000       0000000    
# 000       000      000   000  000       000  000   
#  0000000  0000000   0000000    0000000  000   000  

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
        
        @r_max = 100
        @w_max = 100

        @rx_max = 100
        @tx_max = 100
        
    onTick: (data) =>
        
        return if global.dragging
        
        sysinfo.getDynamicData (d) => 
            
            rx_sec = parseInt d.networkStats[0].rx_sec
            tx_sec = parseInt d.networkStats[0].tx_sec
            
            @rx_max = Math.max @rx_max, rx_sec
            @tx_max = Math.max @tx_max, tx_sec
            
            nd =
                mem: d.mem
                net:
                    rx_sec: rx_sec
                    tx_sec: tx_sec
                    rx_max: @rx_max
                    tx_max: @tx_max
                cpu:
                    sys: d.currentLoad.currentload/100 
                    usr: d.currentLoad.currentload_user/100
                    
            if data.disksIO?
                
                r_sec = d.disksIO.rIO_sec
                w_sec = d.disksIO.wIO_sec
                
                @r_max = Math.max @r_max, r_sec
                @w_max = Math.max @w_max, w_sec
                
                nd.dsk = 
                    r_sec: r_sec
                    w_sec: w_sec
                    r_max: @r_max
                    w_max: @w_max
            
            data.send @, nd

# 00     00   0000000   000   000   0000000  00000000  
# 000   000  000   000  000   000  000       000       
# 000000000  000   000  000   000  0000000   0000000   
# 000 0 000  000   000  000   000       000  000       
# 000   000   0000000    0000000   0000000   00000000  

class Mouse
    
    @: (@name='mouse' @receivers=[]) ->
        
        # ioHook.on 'mousewheel' @onEvent
        # ioHook.on 'mousemove'  @onEvent
        # ioHook.on 'mousedown'  @onEvent
        # ioHook.on 'mouseup'    @onEvent
        
        @last = Date.now()
        @interval = parseInt 1000/60
        @lastEvent = null
        @sendTimer = null
        
    onEvent: (event) =>
        
        @lastEvent = event
        now = Date.now()
        clearTimeout @sendTimer
        @sendTimer = null
        if now - @last > @interval
            @last = now
            post.toMain @name, event
            for receiver in @receivers
                log "receiver:#{kstr receiver} name:#{@name} event:#{kstr event}"
                post.toWin receiver, 'data', event
        else
            @sendTimer = setTimeout (=> @onEvent @lastEvent), @interval
        
# 000   000  00000000  000   000  0000000     0000000    0000000   00000000   0000000    
# 000  000   000        000 000   000   000  000   000  000   000  000   000  000   000  
# 0000000    0000000     00000    0000000    000   000  000000000  0000000    000   000  
# 000  000   000          000     000   000  000   000  000   000  000   000  000   000  
# 000   000  00000000     000     0000000     0000000   000   000  000   000  0000000    

class Keyboard
    
    @: (@name='keyboard' @receivers=[]) ->
        
        # ioHook.on 'keydown' @onEvent
        # ioHook.on 'keyup'   @onEvent

    onEvent: (event) =>
        
        post.toMain @name, event
        for receiver in @receivers
            post.toWin receiver, @name, event
        
# 0000000     0000000   000   000  000   000  0000000     0000000  
# 000   000  000   000  000   000  0000  000  000   000  000       
# 0000000    000   000  000   000  000 0 000  000   000  0000000   
# 000   000  000   000  000   000  000  0000  000   000       000  
# 0000000     0000000    0000000   000   000  0000000    0000000   

class Bounds
    
    @: (@name='bounds' @receivers=[]) ->
        
        post.on 'bounds' @onBounds
        
        @lastInfos = null
        @onBounds()
       
    onBounds: (msg, arg) =>
        
        bounds = require './bounds'
        infos = bounds.infos
        if not _.isEqual infos, @lastInfos
            @lastInfos = infos
            for receiver in @receivers
                log "receiver:#{kstr receiver} name:#{@name} event:#{kstr event}"
                post.toWin receiver, 'data', infos
            
#  0000000   00000000   00000000    0000000  
# 000   000  000   000  000   000  000       
# 000000000  00000000   00000000   0000000   
# 000   000  000        000             000  
# 000   000  000        000        0000000   

class Apps
    
    @: (@name='apps' @receivers=[]) ->
        
        @last     = Date.now()
        @interval = parseInt 1000
        @lastApps = null
        @timer    = null
        
    start: => @update force:true
        
    update: (force=false) =>
        
        return if os.platform() != 'win32'

        clearTimeout @timer
        
        if not global.dragging
            
            proclist = wxw 'proc'
                
            apps = Array.from new Set proclist.map (p) -> p.path
            
            apps = apps.filter (p) -> 
                s = slash.path slash.removeDrive p 
                if s.startsWith '/Windows/System32'
                    return slash.base(s) in ['cmd' 'powershell']
                true
                    
            apps.sort()
            
            if force or not _.isEqual apps, @lastApps
                post.toMain 'apps', apps
                for receiver in @receivers
                    log "receiver:#{kstr receiver} name:#{@name} apps:#{apps.length}"
                    post.toWin receiver, 'data', apps
                
                @lastApps = apps
            
        @timer = setTimeout @update, @interval
                
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   

class Wins
    
    @: (@name='wins' @receivers=[]) ->
        
        @last     = Date.now()
        @interval = parseInt 1000
        @lastWins = null
        @timer    = null
        
    start: => @update force:true
        
    update: (force=false) =>
        
        return if os.platform() != 'win32'
        
        clearTimeout @timer
        
        if not global.dragging
        
            wins = wxw 'info'
            
            if force or not _.isEqual wins, @lastWins
                post.toMain 'wins', wins
                for receiver in @receivers
                    log "receiver:#{kstr receiver} name:#{@name} apps:#{apps.length}"
                    post.toWin receiver, 'data', apps
                
                @lastWins = wins
            
        @timer = setTimeout @update, @interval
        
module.exports = Data

