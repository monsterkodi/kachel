###
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000   
###

{ elem } = require 'kxk'

utils  = require './utils'
Kachel = require './kachel'

class Sysinfo extends Kachel
        
    @: -> super
    
    onLoad: ->
        
        grid = elem 'div' class:'grid2x2' children:[
            elem 'div' class:'grid2x2_11'
            elem 'div' class:'grid2x2_12'
            elem 'div' class:'grid2x2_21'
            elem 'div' class:'grid2x2_22'
        ]
    
        @main.appendChild grid
    
        info = ->
            sysinfo = require 'systeminformation'
            
            # 000       0000000    0000000   0000000    
            # 000      000   000  000   000  000   000  
            # 000      000   000  000000000  000   000  
            # 000      000   000  000   000  000   000  
            # 0000000   0000000   000   000  0000000    
            
            sysinfo.currentLoad (data) -> 
                # log data

                grid.childNodes[0].innerHTML = ''
                pie = utils.circle fill:'#44f'
                utils.pie svg:pie, fill:'#080' angle:360*data.currentload/100
                utils.pie svg:pie, fill:'#f80' angle:360*data.currentload_user/100
                grid.childNodes[0].appendChild pie
                
            # 00     00  00000000  00     00  
            # 000   000  000       000   000  
            # 000000000  0000000   000000000  
            # 000 0 000  000       000 0 000  
            # 000   000  00000000  000   000  
            
            sysinfo.mem (data) -> 
                
                grid.childNodes[1].innerHTML = ''
                pie = utils.circle fill:'#44f'
                utils.pie svg:pie, fill:'#88f' angle:360*data.used/data.total
                utils.pie svg:pie, fill:'#f80' angle:360*data.active/data.total
                grid.childNodes[1].appendChild pie
            
        setInterval info, 1000
        
module.exports = Sysinfo