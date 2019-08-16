###
000000000   0000000    0000000  000   000  0000000     0000000   00000000   
   000     000   000  000       000  000   000   000  000   000  000   000  
   000     000000000  0000000   0000000    0000000    000000000  0000000    
   000     000   000       000  000  000   000   000  000   000  000   000  
   000     000   000  0000000   000   000  0000000    000   000  000   000  
###

{ post, os, _ } = require 'kxk'

Kachel = require './kachel'

class Taskbar extends Kachel
    
    @: (@kachelId:'taskbar') -> 
        super
        @setIcon __dirname + '/../img/taskbar.png'
                        
    onLeftClick: -> 
    
        if os.platform() == 'win32'
            wxw = require 'wxw'
            wxw 'taskbar' 'toggle'
    
module.exports = Taskbar
