###
0000000     0000000   000000000   0000000 
000   000  000   000     000     000   000
000   000  000000000     000     000000000
000   000  000   000     000     000   000
0000000    000   000     000     000   000
###

{ post, childp, empty, slash, kstr, kpos, last, udp, win, os, klog, _ } = require 'kxk'

sysinfo  = require 'systeminformation'
electron = require 'electron'
wxw      = require 'wxw'

class Data

    @: ->
        
        if os.platform() == 'win32'
            @hookProc  = wxw 'hook' 'proc'
            @hookInput = wxw 'hook' 'input'
            @hookInfo  = wxw 'hook' 'info'
            
        @providers = 
            mouse:      new Mouse
            keyboard:   new Keyboard
            apps:       new Apps
            wins:       new Wins
            clock:      new Clock 
            sysinfo:    new Sysinfo
        
        post.on 'requestData' @onRequestData
        
    start: ->
        
        return if @udp
        
        @udp = new udp port:65432 onMsg:@onUDP
        setTimeout @slowTick, 1000
        
    detach: ->
        if os.platform() == 'win32'
            wxw 'kill' 'wc.exe'
        # else
            # klog wxw 'kill' 'mc'
            
    onUDP: (msg) => 
        
        switch msg.event
            when 'mousedown' 'mousemove' 'mouseup' 'mousewheel' then @providers.mouse.onEvent msg
            when 'keydown' 'keyup' then @providers.keyboard.onEvent msg
            when 'proc' then @providers.apps.onEvent msg
            when 'info' then @providers.wins.onEvent msg
            # else log msg
        
    onRequestData: (provider, wid) =>
        
        klog "Data.onRequestData provider:#{kstr provider} wid:#{kstr wid}"
            
        if not @providers[provider]
            return klog "Data.onRequestData no provider of type #{provider}"
                    
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
        
    @: (@name='clock' @tick='slow' @receivers=[]) -> 
        
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
        
    @: (@name='sysinfo' @tick='slow' @receivers=[]) ->
        
        fork = childp.fork "#{__dirname}/memnet"
        fork.on 'message' @onMessage
        
    onMessage: (m) => @data = JSON.parse m
        
    onTick: (data) => data.send @, @data if @data
        
# 00     00   0000000   000   000   0000000  00000000  
# 000   000  000   000  000   000  000       000       
# 000000000  000   000  000   000  0000000   0000000   
# 000 0 000  000   000  000   000       000  000       
# 000   000   0000000    0000000   0000000   00000000  

class Mouse
    
    @: (@name='mouse' @receivers=[]) ->
                
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
            
            pos = kpos event
            if os.platform() == 'win32'
                pos = kpos(electron.screen.screenToDipPoint pos).rounded()
            
            bounds = require './bounds'
            pos = pos.clamp kpos(0,0), kpos bounds.screenWidth, bounds.screenHeight
            
            event.x = pos.x
            event.y = pos.y
        
            post.toMain @name, event
            for receiver in @receivers
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
                post.toWin receiver, 'data', infos
            
#  0000000   00000000   00000000    0000000  
# 000   000  000   000  000   000  000       
# 000000000  00000000   00000000   0000000   
# 000   000  000        000             000  
# 000   000  000        000        0000000   

class Apps
    
    @: (@name='apps' @receivers=[]) ->
        
        @lastApps = null        
        
    onEvent: (event) =>
        
        apps = Array.from new Set event.proc.map (p) -> p.path
        
        apps.pop() if empty last apps
        
        if os.platform() == 'win32'
            apps = apps.filter (p) -> 
                s = slash.path slash.removeDrive p 
                if s.startsWith '/Windows/System32'
                    return slash.base(s) in ['cmd' 'powershell']
                true
                 
        apps.sort()
        if not _.isEqual apps, @lastApps
            post.toMain 'apps' apps
            for receiver in @receivers
                post.toWin receiver, 'data' apps
             
            @lastApps = apps
        
# 000   000  000  000   000   0000000  
# 000 0 000  000  0000  000  000       
# 000000000  000  000 0 000  0000000   
# 000   000  000  000  0000       000  
# 00     00  000  000   000  0000000   

class Wins
    
    @: (@name='wins' @receivers=[]) ->
        
        @lastWins = null

    onEvent: (event) =>
        
        wins = event.info
        
        if os.platform() == 'darwin'
            for win in wins
                if win.index == 0
                    win.status += ' top'
                    
        wins.pop() if empty last wins
        if not _.isEqual wins, @lastWins
            post.toMain 'wins' wins
            for receiver in @receivers
                post.toWin receiver, 'data' apps
            @lastWins = wins
    
module.exports = Data

