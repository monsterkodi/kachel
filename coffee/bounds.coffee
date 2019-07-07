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
        
    @overlap: (a,b) ->
        not (a.x > b.x+b.width  or
             b.x > a.x+a.width  or
             a.y > b.y+b.height or
             b.y > a.y+a.height)
             
    @borderDist: (b) ->
        dx = if b.x < @sw()/2 then b.x else @sw() - (b.x + b.width)
        dy = if b.y < @sh()/2 then b.y else @sh() - (b.y + b.height)
        Math.min dx, dy
        
    @getInfos: (kacheln) ->
        
        index = 0
        infos = kacheln.map (k) => 
            kachel: k
            index:  index++
            bounds: @onScreen k.getBounds()
            
        infos.sort (a,b) =>
            @borderDist(a.bounds) - @borderDist(b.bounds)

        infos
        
    @gapRight: (a, b) -> b.x - (a.x + a.width)
    @gapLeft:  (a, b) -> a.x - (b.x + b.width)
    @gapUp:    (a, b) -> a.y - (b.y + b.height)
    @gapDown:  (a, b) -> b.y - (a.y + a.height)
        
    @isCloseNeighbor: (bounds, info, dir) ->
        
        switch dir
            when 'right' then return 0 <= @gapRight(bounds, info.bounds) < bounds.width
            when 'left'  then return 0 <= @gapLeft( bounds, info.bounds) < bounds.width
            when 'down'  then return 0 <= @gapDown( bounds, info.bounds) < bounds.height
            when 'up'    then return 0 <= @gapUp(   bounds, info.bounds) < bounds.height
        
    @closeNeighbor: (infos, kachel, dir) ->
        kb = kachel.getBounds()
        for info in infos
            continue if info.kachel == kachel
            return info if @isCloseNeighbor kb, info, dir
        
    @snap: (kacheln, kachel) ->
        
        # klog "snap #{kachel.id}"
        b = kachel.getBounds()
        
        horz = false
        vert = false
        
        sw = @sw()
        sh = @sh()
        sy = @sy()
        
        if b.x < 0 or b.x < 72
            horz = true
            b.x = 0
        else if b.x + b.width > sw or b.x + b.width > sw - 72
            horz = true
            b.x = sw - b.width

        if b.y < 0 or b.y < 72
            vert = true
            b.y = 0
        else if b.y + b.height > sh or b.y + b.height > sh - 72
            vert = true
            b.y = sh - b.height
            
        infos = @getInfos kacheln
        for info in infos
            continue if info.kachel == kachel
            if @overlap b, info.bounds
                b.y = info.bounds.y + info.bounds.height
        
        if not vert
            if n = @closeNeighbor infos, kachel, 'up'
                b.y = n.bounds.y + n.bounds.height
            else if n = @closeNeighbor infos, kachel, 'down'
                b.y = n.bounds.y - b.height

        if not horz
            if n = @closeNeighbor infos, kachel, 'right'
                b.x = n.bounds.x - b.width
            else if n = @closeNeighbor infos, kachel, 'left'
                b.x = n.bounds.x + n.bounds.width
            
        kachel.setBounds b
        post.toWin kachel.id, 'saveBounds'
        
    @arrange: (kacheln) ->
        
        infos = @getInfos kacheln 
                        
        for index in [0...infos.length]
            pinned = infos[0..index]
            check  = infos[index+1..]
            pb = pinned[-1].bounds
            for k in check
                if @overlap pb, k.bounds
                    k.bounds.y = pb.y + pb.height
            
        for info in infos
            info.kachel.setBounds info.bounds
            post.toWin info.kachel.id, 'saveBounds'
        
module.exports = Bounds
