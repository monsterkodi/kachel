###
 0000000  000      00000000  00000000  00000000 
000       000      000       000       000   000
0000000   000      0000000   0000000   00000000 
     000  000      000       000       000      
0000000   0000000  00000000  00000000  000      
###

{ childp, os, _ } = require 'kxk'

Kachel = require './kachel'

class Sleep extends Kachel
    
    @: (@kachelId:'sleep') -> 
        super
        @setIcon __dirname + '/../icons/sleep.png'
                        
    onLeftClick: -> 
    
        if os.platform() == 'darwin'
            childp.exec 'pmset sleepnow'
        else
            childp.exec 'shutdown /h'

module.exports = Sleep
