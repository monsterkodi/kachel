###
 0000000  000   000  000   000  000000000  0000000     0000000   000   000  000   000
000       000   000  000   000     000     000   000  000   000  000 0 000  0000  000
0000000   000000000  000   000     000     000   000  000   000  000000000  000 0 000
     000  000   000  000   000     000     000   000  000   000  000   000  000  0000
0000000   000   000   0000000      000     0000000     0000000   00     00  000   000
###

{ post, childp, os, _ } = require 'kxk'

Kachel = require './kachel'

class Shutdown extends Kachel
    
    @: (@kachelId:'shutdown') -> 
        super
        @setIcon __dirname + '/../icons/shutdown.png'
                        
    onLeftClick: -> 
    
        if os.platform() == 'darwin'
            childp.exec "/usr/bin/osascript -e 'tell app \"System Events\" to shut down'"
            post.toMain 'quit'
        else
            childp.exec 'shutdown /s /t 0'

module.exports = Shutdown
