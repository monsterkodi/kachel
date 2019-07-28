###
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000 
###

{ post, clamp, klog, kpos, os } = require 'kxk'

if os.platform()=='win32' then wxw = require 'wxw'
electron = require 'electron'

class Bounds

    @infos: null
    
    @screenWidth:  0
    @screenHeight: 0
    @screenTop:    0
    
    @setBounds: (kachel, b) ->
        
        kachel.setBounds b
        post.toWin kachel.id, 'saveBounds'
        post.emit 'bounds' kachel, b
        
    @updateScreenSize: ->
        
        if os.platform() == 'win32'            
            ss = wxw('screen' 'user')
            sp = x:ss.width, y:ss.height
            vs = kpos(electron.screen.screenToDipPoint sp).rounded() 
            @screenWidth  = vs.x
            @screenHeight = vs.y
            @screenTop    = 0
        else
            @screenWidth  = electron.screen.getPrimaryDisplay().workAreaSize.width
            @screenHeight = electron.screen.getPrimaryDisplay().workAreaSize.height
            @screenTop    = electron.screen.getPrimaryDisplay().workArea.y
    
    # 000  000   000  00000000   0000000    0000000  
    # 000  0000  000  000       000   000  000       
    # 000  000 0 000  000000    000   000  0000000   
    # 000  000  0000  000       000   000       000  
    # 000  000   000  000        0000000   0000000   
    
    @getInfos: (kacheln) ->
        
        kacheln ?= electron.BrowserWindow.getAllWindows()
        
        minX = minY = 9999
        maxX = maxY = 0
        
        infos = kacheln.map (k) =>
            
            b = @validBounds k
            minX = Math.min minX, b.x
            minY = Math.min minY, b.y
            maxX = Math.max maxX, b.x+b.width
            maxY = Math.max maxY, b.y+b.height
            
            kachel: k
            bounds: b
            
        infos.sort (a,b) => @borderDist(a.bounds) - @borderDist(b.bounds)

        infos.kachelBounds = 
            x:      minX
            y:      minY
            width:  maxX-minX
            height: maxY-minY
            
        @infos = infos
        @infos
    
    #  0000000   0000000  00000000   00000000  00000000  000   000  
    # 000       000       000   000  000       000       0000  000  
    # 0000000   000       0000000    0000000   0000000   000 0 000  
    #      000  000       000   000  000       000       000  0000  
    # 0000000    0000000  000   000  00000000  00000000  000   000  
    
    @validBounds: (kachel) -> @onScreen kachel.getBounds()
        
    @onScreen: (b) ->
        
        b.x = clamp 0, @screenWidth  - b.width,  b.x
        b.y = clamp 0, @screenHeight - b.height, b.y
        
        if b.x + b.width  > @screenWidth - b.width  then b.x = @screenWidth-b.width
        if b.y + b.height > @screenTop+@screenHeight - b.height then b.y = @screenTop+@screenHeight-b.height
        if b.x < b.width  then b.x = 0
        if b.y - @screenTop < b.height then b.y = @screenTop
        b
        
    @isOnScreen: (b) ->
        
        if b.y < 0 or b.x < 0 then return false
                
        if b.x + b.width  > @screenWidth then return false
        if b.y + b.height > @screenTop+@screenHeight then return false
        true
        
    #  0000000   000   000  00000000  00000000   000       0000000   00000000   
    # 000   000  000   000  000       000   000  000      000   000  000   000  
    # 000   000   000 000   0000000   0000000    000      000000000  00000000   
    # 000   000     000     000       000   000  000      000   000  000        
    #  0000000       0      00000000  000   000  0000000  000   000  000        
    
    @overlap: (a,b) ->
        
        if not a or not b
            return false
        not (a.x > b.x+b.width-1  or
             b.x > a.x+a.width-1  or
             a.y > b.y+b.height-1 or
             b.y > a.y+a.height-1)
             
    @overlapInfo: (b) ->
        
        for info in @infos
            if @overlap info.bounds, b
                return info
             
    @borderDist: (b) ->
        
        dx = if b.x < @screenWidth/2 then b.x else @screenWidth - (b.x + b.width)
        dy = if b.y < @screenHeight/2 then b.y else @screenHeight - (b.y + b.height)
        Math.min dx, dy
      
    #  0000000   0000000   000   000  000000000   0000000   000  000   000   0000000  
    # 000       000   000  0000  000     000     000   000  000  0000  000  000       
    # 000       000   000  000 0 000     000     000000000  000  000 0 000  0000000   
    # 000       000   000  000  0000     000     000   000  000  000  0000       000  
    #  0000000   0000000   000   000     000     000   000  000  000   000  0000000   
    
    @posInBounds: (p, b) ->
        
        p.x >= b.x and p.x <= b.x+b.width and p.y >= b.y and p.y <= b.y+b.height
        
    @kachelAtPos: (p) ->
        
        for k in @infos
            return k if @posInBounds p, k.bounds
            
    @gapRight: (a, b) -> b.x - (a.x + a.width)
    @gapLeft:  (a, b) -> a.x - (b.x + b.width)
    @gapUp:    (a, b) -> a.y - (b.y + b.height)
    @gapDown:  (a, b) -> b.y - (a.y + a.height)
        
    # 000   000  00000000  000   0000000   000   000  0000000     0000000   00000000   
    # 0000  000  000       000  000        000   000  000   000  000   000  000   000  
    # 000 0 000  0000000   000  000  0000  000000000  0000000    000   000  0000000    
    # 000  0000  000       000  000   000  000   000  000   000  000   000  000   000  
    # 000   000  00000000  000   0000000   000   000  0000000     0000000   000   000  
    
    @isCloseNeighbor: (bounds, info, dir) ->
        
        switch dir
            when 'right' then return 0 <= @gapRight(bounds, info.bounds) < bounds.width
            when 'left'  then return 0 <= @gapLeft( bounds, info.bounds) < bounds.width
            when 'down'  then return 0 <= @gapDown( bounds, info.bounds) < bounds.height
            when 'up'    then return 0 <= @gapUp(   bounds, info.bounds) < bounds.height
        
    @closeNeighbor: (kachel, dir) ->
        
        kb = kachel.getBounds()
        
        @infos.sort (a,b) -> # this might break change detection!
            switch dir
                when 'left''right' then Math.abs(a.bounds.y - kb.y) - Math.abs(b.bounds.y - kb.y)
                when 'up''down'    then Math.abs(a.bounds.x - kb.x) - Math.abs(b.bounds.x - kb.x)
        
        for info in @infos
            continue if info.kachel == kachel
            if @isCloseNeighbor kb, info, dir
                return info 

    @nextNeighbor: (kachel, dir) ->
        
        if neighbor = @closeNeighbor kachel, dir
            kb = kachel.getBounds()
            switch dir
                when 'left''right' then return neighbor if neighbor.bounds.y == kb.y    
                when 'up''down'    then return neighbor if neighbor.bounds.x == kb.x    
                
    #  0000000  000   000   0000000   00000000   
    # 000       0000  000  000   000  000   000  
    # 0000000   000 0 000  000000000  00000000   
    #      000  000  0000  000   000  000        
    # 0000000   000   000  000   000  000        
    
    @snap: (kachel, b) ->
                
        b ?= kachel.getBounds()
        
        horz = false
        vert = false
        
        if b.x < 0 or b.x < 72
            horz = true
            b.x = 0
        else if b.x + b.width > @screenWidth or b.x + b.width > @screenWidth - 72
            horz = true
            b.x = @screenWidth - b.width

        if b.y < 0 or b.y < 72
            vert = true
            b.y = 0
        else if b.y + b.height > @screenTop+@screenHeight or b.y + b.height > @screenTop+@screenHeight - 72
            vert = true
            b.y = @screenTop+@screenHeight - b.height
        
        @getInfos()
                    
        for info in @infos
            continue if info.kachel == kachel
            if @overlap b, info.bounds
                b.y = info.bounds.y + info.bounds.height
        
        if not vert
            if n = @closeNeighbor kachel, 'up'
                b.y = n.bounds.y + n.bounds.height
            else if n = @closeNeighbor kachel, 'down'
                b.y = n.bounds.y - b.height

        if not horz
            if n = @closeNeighbor kachel, 'right'
                b.x = n.bounds.x - b.width
            else if n = @closeNeighbor kachel, 'left'
                b.x = n.bounds.x + n.bounds.width
        b
                
module.exports = Bounds
