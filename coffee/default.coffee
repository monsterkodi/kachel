###
0000000    00000000  00000000   0000000   000   000  000    000000000  
000   000  000       000       000   000  000   000  000       000     
000   000  0000000   000000    000000000  000   000  000       000     
000   000  000       000       000   000  000   000  000       000     
0000000    00000000  000       000   000   0000000   0000000   000     
###

{ elem } = require 'kxk'

Kachel = require './kachel'

class Default extends Kachel
        
    @: -> super
    
    onLoad: ->
        
        grid = elem 'div' class:'grid2x2' children:[
            elem 'img' class:'grid2x2_11' src:__dirname + '/../img/about.png'    
            elem 'img' class:'grid2x2_12' src:__dirname + '/../img/about.png'    
            elem 'img' class:'grid2x2_21' src:__dirname + '/../img/about.png'    
            elem 'img' class:'grid2x2_22' src:__dirname + '/../img/about.png'    
        ]
    
        @main.appendChild grid
        
    onClick: (event) ->
        
        log 'default' event

module.exports = Default