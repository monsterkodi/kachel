###
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000 
###

{ post, clamp, klog } = require 'kxk'

electron = require 'electron'

class Bounds
    
    @sw: -> electron.screen.getPrimaryDisplay().workAreaSize.width
    @sh: -> electron.screen.getPrimaryDisplay().workAreaSize.height
    @sy: -> electron.screen.getPrimaryDisplay().workArea.y

    @onScreen: (b) ->
        
        sw = @sw()
        sh = @sh()
        sy = @sy()
        
        b.x = clamp 0, sw - b.width,  b.x
        b.y = clamp 0, sh - b.height, b.y
        
        if b.x + b.width  > sw - b.width  then b.x = sw-b.width
        if b.y + b.height > sh - b.height then b.y = sh-b.height
        if b.x      < b.width  then b.x = 0
        if b.y - sy < b.height then b.y = sy
        
        b
        
    @onGrid: (b) ->
        klog 'size' @sw(), @sh(), @sy(), b
        snap = 32
        # klog 'snap' b.x, b.x % snap
        # if b.x % snap
            # klog 'mod' b.x % snap
            # b.x -= b.x % snap
        b
        
    @overlap: (a,b) ->
        not (a.x > b.x+b.width  or
             b.x > a.x+a.width  or
             a.y > b.y+b.height or
             b.y > a.y+a.height)
        
    @arrange: (kacheln) ->
        
        index = 0
        infos = kacheln.map (k) => 
            kachel: k
            index:  index++
            bounds: @onScreen k.getBounds()
        
        infos.sort (a,b) -> 
            dx = a.bounds.x - b.bounds.x
            if dx == 0
                a.bounds.y - b.bounds.y
            else
                dx

        for index in [0...infos.length]
            pinned = infos[0..index]
            check  = infos[index+1..]
            for k in check
                pb = pinned[-1].bounds
                if @overlap pb, k.bounds
                    k.bounds.y = pb.y + pb.height
            
        for info in infos
            # klog info.bounds.x, info.bounds.y
            info.kachel.setBounds info.bounds
            post.toWin info.kachel.id, 'saveBounds'
        
module.exports = Bounds
