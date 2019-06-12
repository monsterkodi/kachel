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
            elem 'img' class:'grid2x2_11' click:@openApp, src:__dirname + '/../img/app.png' 
            elem 'img' class:'grid2x2_12' click:@openCmd, src:__dirname + '/../img/cmd.png' 
            elem 'img' class:'grid2x2_21' click:@openGit, src:__dirname + '/../img/git.png'    
            elem 'img' class:'grid2x2_22' click:@openNpm, src:__dirname + '/../img/npm.png'     
        ]
    
        @main.appendChild grid
        
    openApp: => log 'openApp'
    openGit: => log 'openGit'
    openNpm: => log 'openNpm'
    openCmd: => log 'openCmd'

module.exports = Default