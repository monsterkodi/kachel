###
000000000   0000000    0000000  000   000  0000000     0000000   00000000   
   000     000   000  000       000  000   000   000  000   000  000   000  
   000     000000000  0000000   0000000    0000000    000000000  0000000    
   000     000   000       000  000  000   000   000  000   000  000   000  
   000     000   000  0000000   000   000  0000000    000   000  000   000  
###

{ post, os, $, _ } = require 'kxk'

Kachel = require './kachel'
wxw = require 'wxw'
            
class Taskbar extends Kachel
    
    @: (@kachelId:'taskbar') -> 
        super
        @setIcon __dirname + '/../img/taskbar.png'
        $('.applicon').style = 'opacity:0.3;'
                        
    onLeftClick: -> 
    
        if os.platform() == 'win32'
            wxw 'taskbar' 'toggle'
            post.toMain 'screensize'
    
module.exports = Taskbar
