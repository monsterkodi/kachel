###
 0000000  000      00000000   0000000   000   000  
000       000      000       000   000  0000  000  
000       000      0000000   000000000  000 0 000  
000       000      000       000   000  000  0000  
 0000000  0000000  00000000  000   000  000   000  
###

{ post, os, _ } = require 'kxk'

Kachel = require './kachel'

class Clean extends Kachel
        
    @: (@kachelId:'clean') -> 
        super
        @setIcon __dirname + '/../img/clean.png'
    
    onLeftClick: -> post.toMain 'cleanTiles'
    
module.exports = Clean
