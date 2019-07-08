###
00     00   0000000   000  000   000  000   000  000  000   000
000   000  000   000  000  0000  000  000 0 000  000  0000  000
000000000  000000000  000  000 0 000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000  000   000  000  000  0000
000   000  000   000  000  000   000  00     00  000  000   000
###

{ post, elem, _ } = require 'kxk'

Kachel = require './kachel'

class MainWin extends Kachel
        
    @: (@kachelId:'main') -> super
    
    onLoad: -> @main.appendChild elem 'img', class:'kachelImg' src:__dirname + '/../img/about.png'    
        
    onClick: -> post.toMain 'raiseKacheln'

module.exports = MainWin