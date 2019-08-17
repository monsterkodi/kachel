###
00000000   00000000   0000000  000000000   0000000   00000000   000000000
000   000  000       000          000     000   000  000   000     000   
0000000    0000000   0000000      000     000000000  0000000       000   
000   000  000            000     000     000   000  000   000     000   
000   000  00000000  0000000      000     000   000  000   000     000   
###

{ post, childp, os, _ } = require 'kxk'

Kachel = require './kachel'

class Restart extends Kachel
    
    @: (@kachelId:'restart') -> 
        super
        @setIcon __dirname + '/../icons/restart.png'
                        
    onLeftClick: -> 
    
        if os.platform() == 'darwin'
            childp.exec "/usr/bin/osascript -e 'tell app \"System Events\" to restart'"
            post.toMain 'quit'
        else
            childp.exec 'shutdown /r /t 0'

module.exports = Restart
