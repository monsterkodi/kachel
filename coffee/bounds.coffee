###
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000 
###

{ post, clamp, empty, klog, kpos, os } = require 'kxk'

wxw = require 'wxw'

electron = require 'electron'

class Bounds

    @kachelSizes: [36 48 72 108 144 216]
    @infos: null
    
    @screenWidth:  0
    @screenHeight: 0
    @screenTop:    0
    
    @setBounds: (kachel, b) ->
        kachel.setBounds b
        post.toWin kachel.id, 'saveBounds'
        post.emit 'bounds' kachel, b

    @init: ->
        
        @updateScreenSize()
        @update()
        post.on 'cleanTiles' @cleanTiles
            
    #  0000000  000      00000000   0000000   000   000  
    # 000       000      000       000   000  0000  000  
    # 000       000      0000000   000000000  000 0 000  
    # 000       000      000       000   000  000  0000  
    #  0000000  0000000  00000000  000   000  000   000  
    
    @cleanTiles: =>
        klog 'cleanTiles', @infos.length
        @update()
        for info in @infos
            kb = info.bounds
            
            if kb.width not in @kachelSizes
                kb.width = @kachelSizes[@kachelSize info.kachel]
                @setBounds info.kachel, kb
                return @cleanTiles()
                
            if kb.height not in @kachelSizes
                kb.height = @kachelSizes[@kachelSize info.kachel]
                @setBounds info.kachel, kb
                return @cleanTiles()
                
            if overlap = @overlapInfo info.kachel, kb
                
                ox = kb.x
                nx = ox - 72
                kb.x = nx
                while nx > 0 and overlap = @overlapInfo info.kachel, kb
                    nx -= 72
                    kb.x = nx
                    
                if nx <= 0
                    nx = ox + 72
                    kb.x = nx
                    while nx < @screenWidth and overlap = @overlapInfo info.kachel, kb
                        nx += 72
                        kb.x = nx
                        
                if not @overlapInfo info.kachel, kb
                    @snap info.kachel, kb
                    return @cleanTiles()
                
    @kachelSize: (k) ->
        kb = k.getBounds()
        size = 0        
        while size < @kachelSizes.length-1 and Math.abs(kb.width - @kachelSizes[size]) > 8
            size++
        size
                
    @updateScreenSize: ->
        
        if os.platform() == 'win32'            
            ss = wxw 'screen' 'user'
            sp = x:ss.width, y:ss.height
            vs = kpos(electron.screen.screenToDipPoint sp).rounded() 
            @screenWidth  = vs.x
            @screenHeight = vs.y
            @screenTop    = 0
        else
            @screenWidth  = electron.screen.getPrimaryDisplay().workAreaSize.width
            @screenHeight = electron.screen.getPrimaryDisplay().workAreaSize.height
            @screenTop    = electron.screen.getPrimaryDisplay().workArea.y
    
    # 000   000  00000000   0000000     0000000   000000000  00000000  
    # 000   000  000   000  000   000  000   000     000     000       
    # 000   000  00000000   000   000  000000000     000     0000000   
    # 000   000  000        000   000  000   000     000     000       
    #  0000000   000        0000000    000   000     000     00000000  
    
    @update: ->
        
        kacheln = global.kacheln()
        
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
        
    @remove: (kachel) ->
        
        for index in [0...@infos.length]
            info = @infos[index]
            if info.kachel == kachel
                @infos.splice index, 1
                klog "removing kachel #{index}" kachel.id
                return
    
    #  0000000   0000000  00000000   00000000  00000000  000   000  
    # 000       000       000   000  000       000       0000  000  
    # 0000000   000       0000000    0000000   0000000   000 0 000  
    #      000  000       000   000  000       000       000  0000  
    # 0000000    0000000  000   000  00000000  00000000  000   000  
    
    @validBounds: (kachel) -> @onScreen kachel.getBounds()
        
    @onScreen: (b) ->
        
        b.x = clamp 0, @screenWidth  - b.width,  b.x
        b.y = clamp @screenTop, @screenTop+@screenHeight - b.height, b.y
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
        
        if not a or not b then return false
            
        not (a.x > b.x+b.width-1  or
             b.x > a.x+a.width-1  or
             a.y > b.y+b.height-1 or
             b.y > a.y+a.height-1)
             
    @overlapInfo: (kachel, b) ->
        
        for info in @infos
            if info.kachel == kachel then continue
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
                    
    # 000   000  00000000  000   0000000   000   000  0000000     0000000   00000000   
    # 0000  000  000       000  000        000   000  000   000  000   000  000   000  
    # 000 0 000  0000000   000  000  0000  000000000  0000000    000   000  0000000    
    # 000  0000  000       000  000   000  000   000  000   000  000   000  000   000  
    # 000   000  00000000  000   0000000   000   000  0000000     0000000   000   000  
                                    
    @neighborKachel: (kachel, dir) ->
        
        kb = kachel.getBounds()
        kacheln = global.kacheln()
        
        ks = kacheln.filter (k) ->
            return false if k == kachel
            b = k.getBounds()
            switch dir
                when 'right' then b.x  >= kb.x+kb.width
                when 'down'  then b.y  >= kb.y+kb.height
                when 'left'  then b.x+b.width  <= kb.x 
                when 'up'    then b.y+b.height <= kb.y 
    
        return kachel if empty ks
                
        inline = ks.filter (k) ->
            b = k.getBounds()
            switch dir
                when 'left' 'right' then b.y < kb.y+kb.height and b.y+b.height > kb.y
                when 'up' 'down'    then b.x < kb.x+kb.width  and b.x+b.width  > kb.x
        
        if inline.length 
            ks = inline
                
        ks.sort (a,b) ->
            ab = a.getBounds()
            bb = b.getBounds()
            switch dir
                when 'right' 
                    a = Math.abs((kb.y+kb.height/2) - (ab.y+ab.height/2)) + (ab.x - kb.x)
                    b = Math.abs((kb.y+kb.height/2) - (bb.y+bb.height/2)) + (bb.x - kb.x)
                when 'left'  
                    a = Math.abs((kb.y+kb.height/2) - (ab.y+ab.height/2)) + (kb.x - ab.x)
                    b = Math.abs((kb.y+kb.height/2) - (bb.y+bb.height/2)) + (kb.x - bb.x)
                when 'down'  
                    a = Math.abs((kb.x+kb.width/2) - (ab.x+ab.width/2)) + (ab.y - kb.y)
                    b = Math.abs((kb.x+kb.width/2) - (bb.x+bb.width/2)) + (bb.y - kb.y)
                when 'up'    
                    a = Math.abs((kb.x+kb.width/2) - (ab.x+ab.width/2)) + (kb.y - ab.y)
                    b = Math.abs((kb.x+kb.width/2) - (bb.x+bb.width/2)) + (kb.y - bb.y)
            a-b
        ks[0]
                 
    # 00     00   0000000   000   000  00000000  
    # 000   000  000   000  000   000  000       
    # 000000000  000   000   000 000   0000000   
    # 000 0 000  000   000     000     000       
    # 000   000   0000000       0      00000000  
    
    @moveKachel: (kachel, dir) ->
                
        b = @validBounds kachel
        
        nb = x:b.x, y:b.y, width:b.width, height:b.height
        switch dir 
            when 'up'       then nb.y = b.y - b.height
            when 'down'     then nb.y = b.y + b.height
            when 'right'    then nb.x = b.x + b.width 
            when 'left'     then nb.x = b.x - b.width 
            
        if info = @overlapInfo kachel, nb
            
            gap = (s, d, f, b, o) =>
                g = f b, o
                if g > 0
                    nb[d] = b[d] + s * g
                    @setBounds kachel, nb
                    true
                    
            r = switch dir 
                when 'up'    then gap -1 'y' @gapUp,    b, info.bounds
                when 'down'  then gap +1 'y' @gapDown,  b, info.bounds
                when 'right' then gap +1 'x' @gapRight, b, info.bounds
                when 'left'  then gap -1 'x' @gapLeft,  b, info.bounds
            return if r
                   
        @setBounds kachel, @isOnScreen(nb) and nb or b

    @gapRight: (a, b) -> b.x - (a.x + a.width)
    @gapLeft:  (a, b) -> a.x - (b.x + b.width)
    @gapUp:    (a, b) -> a.y - (b.y + b.height)
    @gapDown:  (a, b) -> b.y - (a.y + a.height)
    @gap: (a,b,dir) -> 
        switch dir
            when 'up'    then @gapUp    a, b
            when 'down'  then @gapDown  a, b
            when 'left'  then @gapLeft  a, b
            when 'right' then @gapRight a, b
        
    #  0000000   0000000   00000000   000000000  
    # 000       000   000  000   000     000     
    # 0000000   000   000  0000000       000     
    #      000  000   000  000   000     000     
    # 0000000    0000000   000   000     000     
    
    @sortClosest: (k, bounds) ->
        
        kc = kpos(k).plus kpos(k.width, k.height).times(0.5)
        bounds.sort (a,b) ->
            ac = kpos(a).plus kpos(a.width, a.height).times(0.5)
            bc = kpos(b).plus kpos(b.width, b.height).times(0.5)
            da = kc.distSquare ac
            db = kc.distSquare bc
            da - db
            
    @borderBounds: (k, dir) ->
        
        switch dir
            when 'left'  then x:-k.width,     y:k.y,           width:k.width, height:k.height
            when 'right' then x:@screenWidth, y:k.y,           width:k.width, height:k.height
            when 'up'    then x:k.x,          y:-k.height,     width:k.width, height:k.height
            when 'down'  then x:k.x,          y:@screenHeight, width:k.width, height:k.height
    
    # 000  000   000  000      000  000   000  00000000  
    # 000  0000  000  000      000  0000  000  000       
    # 000  000 0 000  000      000  000 0 000  0000000   
    # 000  000  0000  000      000  000  0000  000       
    # 000  000   000  0000000  000  000   000  00000000  
    
    @inlineNeighborBounds: (kb, dir) ->
        
        kc = kpos(kb).plus kpos(kb.width, kb.height).times 0.5
        ks = @infos.filter (info) =>
            return false if @posInBounds kc, info.bounds
            b = info.bounds
            switch dir
                when 'right' then kc.x < b.x
                when 'down'  then kc.y < b.y
                when 'left'  then kc.x > b.x + b.width
                when 'up'    then kc.y > b.y + b.height
    
        if empty ks then return @borderBounds kb, dir
                
        inline = ks.filter (k) ->
            b = k.bounds
            switch dir
                when 'left' 'right' then b.y < kb.y+kb.height and b.y+b.height > kb.y
                when 'up' 'down'    then b.x < kb.x+kb.width  and b.x+b.width  > kb.x
        
        if inline.length 
            
            inline = inline.map (i) -> i.bounds
            @sortClosest kb, inline
            inline[0]
        else
            @borderBounds kb, dir
            
    #  0000000  000   000   0000000   00000000   
    # 000       0000  000  000   000  000   000  
    # 0000000   000 0 000  000000000  00000000   
    #      000  000  0000  000   000  000        
    # 0000000   000   000  000   000  000        
    
    @snap: (kachel, b) ->
           
        b ?= kachel.getBounds()
        
        @update()
                    
        choices = []
        for dir in ['up' 'down' 'left' 'right']
            nb = @inlineNeighborBounds b, dir
            gap = @gap b, nb, dir
            choices.push neighbor:nb, gap:gap, dir:dir
                    
        choices.sort (a,b) -> Math.abs(a.gap) - Math.abs(b.gap)
 
        c = choices[0]
        
        switch c.dir
            when 'up'    then b.y -= c.gap
            when 'down'  then b.y += c.gap
            when 'left'  then b.x -= c.gap
            when 'right' then b.x += c.gap

        kachel.setBounds b
        @update()
            
        choices = []
        for dir in ['up' 'down' 'left' 'right']
            continue if dir == c.dir
            nb = @inlineNeighborBounds b, dir
            gap = @gap b, nb, dir
            choices.push neighbor:nb, gap:gap, dir:dir
                    
        choices.sort (a,b) -> Math.abs(a.gap) - Math.abs(b.gap)
        
        choices = choices.filter (c) -> c.gap
        d = choices[0]
        if d and Math.abs(d.gap) < b.width

            if d.gap < 0
                switch d.dir
                    when 'up' 'down'    then b.y += d.gap
                    when 'left' 'right' then b.x += d.gap
            else
                switch d.dir
                    when 'up'    then b.y -= d.gap
                    when 'down'  then b.y += d.gap
                    when 'left'  then b.x -= d.gap
                    when 'right' then b.x += d.gap
                
        else
            n = c.neighbor
            switch c.dir
                when 'up' 'down'
                    dl = n.x - b.x
                    dr = (n.x+n.width) - (b.x+b.width)
                    if Math.abs(dl) < Math.abs(dr)
                        b.x += dl
                    else
                        b.x += dr
                when 'left' 'right'
                    du = n.y - b.y
                    dd = (n.y+n.height) - (b.y+b.height)
                    if Math.abs(du) < Math.abs(dd)
                        b.y += du
                    else
                        b.y += dd
            
        @setBounds kachel, @onScreen b
                
module.exports = Bounds
