###
000000000   0000000    0000000   000       0000000  
   000     000   000  000   000  000      000       
   000     000   000  000   000  000      0000000   
   000     000   000  000   000  000           000  
   000      0000000    0000000   0000000  0000000   
###

{ post, klog, elem, os, _ } = require 'kxk'

Kachel = require './kachel'

class Tools extends Kachel
        
    @: (@kachelId:'tools') -> super
    
    # 000       0000000    0000000   0000000    
    # 000      000   000  000   000  000   000  
    # 000      000   000  000000000  000   000  
    # 000      000   000  000   000  000   000  
    # 0000000   0000000   000   000  0000000    
    
    onLoad: =>

        children = [
            elem 'img' class:'grid2x2_21' click:@toggleTaskbar, src:__dirname + '/../img/taskbar.png'   
            elem 'img' class:'grid2x2_12' click:@cleanTiles,    src:__dirname + '/../img/clean.png'    
        ]

        for child in children
            child.ondragstart = -> false
         
        grid = elem 'div' class:'grid2x2' children:children

        @main.appendChild grid
        
    # 000000000   0000000    0000000  000   000  0000000     0000000   00000000   
    #    000     000   000  000       000  000   000   000  000   000  000   000  
    #    000     000000000  0000000   0000000    0000000    000000000  0000000    
    #    000     000   000       000  000  000   000   000  000   000  000   000  
    #    000     000   000  0000000   000   000  0000000    000   000  000   000  
    
    toggleTaskbar: -> 
    
        if os.platform() == 'win32'
            wxw = require 'wxw'
            wxw 'taskbar' 'toggle'

    cleanTiles: -> post.toMain 'cleanTiles'
            
module.exports = Tools
