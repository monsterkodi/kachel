###
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000   
###

{ post, klog, _ } = require 'kxk'

sysinfo = require 'systeminformation'

class Sysdata
        
    @: ->
        info = => sysinfo.getDynamicData @setData
        setInterval info, 1000
        @receivers = []

    addReceiver: (wid) -> @receivers.push wid
        
    setData: (@data) =>
        
        for receiver in @receivers
            post.toWin receiver, 'data' @data
        
    getData: -> @data
        
module.exports = Sysdata
