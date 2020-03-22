###
000   000   0000000   000   000  00000000    0000000   0000000    
000  000   000   000  0000  000  000   000  000   000  000   000  
0000000    000   000  000 0 000  0000000    000000000  000   000  
000  000   000   000  000  0000  000   000  000   000  000   000  
000   000   0000000   000   000  000   000  000   000  0000000    
###

{ _, open, os, post, slash, udp } = require 'kxk'

Kachel = require './kachel'

class Konrad extends Kachel
        
    @: (@kachelId:'konrad') ->
        _
        post.on 'app' @onApp
        
        super
    
    onApp: (action, app) =>
        
        switch action 
            when 'activated' then @idleIcon()
            when 'terminated' then @sleepIcon()
        
    onLeftClick: (event) -> open slash.unslash @kachelId 
    
    onContextMenu: (event) => 
        
        if os.platform() == 'win32'
            wxw = require 'wxw'
            wxw 'minimize' slash.file @kachelId
                
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    onInitKachel: (@kachelId) =>
        
        @udp = new udp onMsg:@onMsg, port:9559
        
        @sleepIcon()
        super @kachelId
        
    onMsg: (msg) =>
        
        prefix = msg.split(':')[0]
        
        switch prefix
            when 'version' then @idleIcon()
            when 'error'   then @errorIcon()
            when 'exit'    then @sleepIcon()
            when 'output'
                # klog 'output' msg
                @workIcon()
                setTimeout @idleIcon, 2000
        
    workIcon:  => @setIcon "#{__dirname}/../img/konrad.png"
    idleIcon:  => @setIcon "#{__dirname}/../img/konrad_idle.png"
    errorIcon: => @setIcon "#{__dirname}/../img/konrad_error.png"
    sleepIcon: => @setIcon "#{__dirname}/../img/konrad_sleep.png"
                                   
module.exports = Konrad
