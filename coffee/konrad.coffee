###
000   000   0000000   000   000  00000000    0000000   0000000    
000  000   000   000  0000  000  000   000  000   000  000   000  
0000000    000   000  000 0 000  0000000    000000000  000   000  
000  000   000   000  000  0000  000   000  000   000  000   000  
000   000   0000000   000   000  000   000  000   000  0000000    
###

{ post, childp, prefs, slash, osascript, open, klog, elem, udp, os, fs, _ } = require 'kxk'

Kachel = require './kachel'

class Konrad extends Kachel
        
    @: (@kachelId:'konrad') -> super
        
    onClick: (event) -> open slash.unslash @kachelId 
    
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
        
        @idleIcon()
        super
        
    onMsg: (msg) =>
        
        prefix = msg.split(':')[0]
        
        switch prefix
            when 'version' then @idleIcon()
            when 'error'   then @setIcon "#{__dirname}/../img/konrad_error.png"
            when 'exit'    then @setIcon "#{__dirname}/../img/konrad_sleep.png"
            when 'output'
                # klog 'output' msg
                @setIcon "#{__dirname}/../img/konrad.png"
                setTimeout @idleIcon, 2000
        
    idleIcon: => 
        @setIcon "#{__dirname}/../img/konrad_idle.png"
                
    # 000   0000000   0000000   000   000  
    # 000  000       000   000  0000  000  
    # 000  000       000   000  000 0 000  
    # 000  000       000   000  000  0000  
    # 000   0000000   0000000   000   000  
    
    setIcon: (iconPath) =>
        return if not iconPath
        img = elem 'img' class:'applicon' src:slash.fileUrl slash.path iconPath
        img.ondragstart = -> false
        @main.innerHTML = ''
        @main.appendChild img
                   
module.exports = Konrad
