###
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000   
###

{ elem } = require 'kxk'

Kachel = require './kachel'

class Sysinfo extends Kachel
        
    @: -> super
    
    onLoad: ->
        
        grid = elem 'div' class:'grid2x2' children:[
            elem 'div' class:'grid2x2_11' text:'NaN'
            elem 'div' class:'grid2x2_12' text:'NaN'
            elem 'div' class:'grid2x2_21' text:'NaN'
            elem 'div' class:'grid2x2_22' text:'NaN'
        ]
    
        @main.appendChild grid
    
        info = ->
            sysinfo = require 'systeminformation'
            sysinfo.currentLoad (data) -> grid.childNodes[0].innerHTML = "#{parseInt data.currentload}"
            sysinfo.mem         (data) -> grid.childNodes[1].innerHTML = "#{parseInt data.used/1000000}<br>#{parseInt data.total/1000000}"
            
        setInterval info, 1000
        
module.exports = Sysinfo