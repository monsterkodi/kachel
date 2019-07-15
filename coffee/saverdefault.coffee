###
000   000  00000000   000   000  000   000  000      
000  000   000   000  000  000   000  000   000      
0000000    0000000    0000000    0000000    000      
000  000   000   000  000  000   000  000   000      
000   000  000   000  000   000  000   000  0000000  
###

{ sw, sh, elem, kpos, clamp, randRange, randInt, randIntRange, klog } = require 'kxk'
        
electron = require 'electron'
        
class SaverDefault

    @: ->

        window.onerror = (msg, source, line, col, err) ->
            electron.remote.getCurrentWindow().openDevTools()
            klog 'window.onerror' msg, source, line, col
            error 'window.onerror' msg, source, line, col
            true
        
        document.body.addEventListener 'keydown'   @close
        document.body.addEventListener 'mousedown' @close
        document.body.addEventListener 'mousemove' @onMouseMove
        document.body.focus()
    
        @chooseOptions = [
            [1 2 4 5]
            [0 2 3 5]
            [0 3 4  ]
            [1 2    ]
            [0 1 2  ]
            [0 1 2 4]
        ]
        
        @fadeSteps = 128
        @fade      = 0
        
        @scalef = electron.remote.screen.getPrimaryDisplay().scaleFactor
        @width  = sw()*@scalef
        @height = sh()*@scalef
                        
        @canvas = elem 'canvas' width:@width, height:@height
        @ctx = @canvas.getContext '2d'
        
        if @scalef != 1
            xo = -@width/2+sw()/2
            yo = -@height/2+sh()/2
            @canvas.style.transform = "translate3d(#{xo}px, #{yo}px, 0px) scale3d(#{1/@scalef}, #{1/@scalef}, 1)"
        
        document.body.appendChild @canvas
        
        # electron.remote.getCurrentWindow().openDevTools()
            
        @fadeOut()

    nextRun: ->
        
        @fill 'rgb(0,0,0)'
        @cubeSize  = randIntRange 6 32
        @size      = kpos parseInt(@width/@cubeSize), parseInt(@height/@cubeSize)
        @cubesPerF = parseInt Math.max 1 (33-@cubeSize) * randRange 0.1 0.3
        @cubesMax  = parseInt randIntRange(400000, 600000) / @cubeSize
        @dirCounts = [10 10 10 10 10 10]
        @dirProb   = randRange 0.001 0.9
        @colorSpeed = randRange 0.003 0.1
        
        @red       = 0
        @green     = 0
        @blue      = 0
        @lastDir   = 0
        @cubeCount = 0
                
        @pos = kpos parseInt((@width/@cubeSize)/2), parseInt (@height/@cubeSize)/2
                
        klog "cubeSize #{@cubeSize} cpf #{@cubesPerF} dirprob #{@dirProb} cubesMax #{@cubesMax}"
        
        @animation()
        
    onMouseMove: (event) =>
        
        @startpos ?= kpos event
        if kpos(event).dist(@startpos) > 10
            @close()
        
    close: =>
        
        document.body.removeEventListener 'keydown'   @close
        document.body.removeEventListener 'mousedown' @close
        document.body.removeEventListener 'mousemove' @close
        
        w = electron.remote.getCurrentWindow()
        w.close()
        
    # 00000000   0000000   0000000    00000000  
    # 000       000   000  000   000  000       
    # 000000    000000000  000   000  0000000   
    # 000       000   000  000   000  000       
    # 000       000   000  0000000    00000000  
    
    fadeOut: =>
        
        if @fade < @fadeSteps
            @canvas.width = @canvas.width
            @fade += 1        
            @fill "rgba(0,0,0,#{@fade/@fadeSteps})"        
            window.requestAnimationFrame @fadeOut
        else
            @nextRun()

    blackOut: =>
        
        if @fade < @fadeSteps
            @fade += 1     
            @fill "rgba(0,0,0,#{4/@fadeSteps})"        
            window.requestAnimationFrame @blackOut
        else
            @nextRun()
            
    fill: (color) ->
        
        @ctx.fillStyle = color
        @ctx.fillRect 0, 0, @width, @height
            
    #  0000000   000   000  000  00     00   0000000   000000000  000   0000000   000   000  
    # 000   000  0000  000  000  000   000  000   000     000     000  000   000  0000  000  
    # 000000000  000 0 000  000  000000000  000000000     000     000  000   000  000 0 000  
    # 000   000  000  0000  000  000 0 000  000   000     000     000  000   000  000  0000  
    # 000   000  000   000  000  000   000  000   000     000     000   0000000   000   000  
    
    animation: =>
        
        if @onFrame()
            window.requestAnimationFrame @animation
        
    # 00000000  00000000    0000000   00     00  00000000  
    # 000       000   000  000   000  000   000  000       
    # 000000    0000000    000000000  000000000  0000000   
    # 000       000   000  000   000  000 0 000  000       
    # 000       000   000  000   000  000   000  00000000  
    
    onFrame: ->
        
        for c in [0...@cubesPerF]
                    
            if Math.random() < @dirProb
                nextDir = @changeDirection @lastDir
            else
                nextDir = @lastDir
                
            @nextPos nextDir
                                        
            if @pos.x < 1 or @pos.y < 2 or @pos.x >= @size.x or @pos.y >= @size.y # if screen border is touched
    
                nextDir = randInt 6
    
                if      @pos.x < 1         then @pos.x = @size.x-1
                else if @pos.x > @size.x-1 then @pos.x = 1
                
                if      @pos.y < 2         then @pos.y = @size.y-2
                else if @pos.y > @size.y-1 then @pos.y = 2
            
            @nextColor nextDir
                                            
            skip = null
            if @cubeCount
                switch nextDir
                    when 3 then skip = 0
                    when 4 then skip = 1
                    when 5 then skip = 2
            
            @drawCube skip
            
            @cubeCount += 1
            @lastDir = nextDir
            
        if @cubeCount >= @cubesMax
            @fadeSteps = 128
            @fade      = 0        
            @blackOut()
            return false
        
        true
        
    # 0000000    000  00000000   00000000   0000000  000000000  000   0000000   000   000  
    # 000   000  000  000   000  000       000          000     000  000   000  0000  000  
    # 000   000  000  0000000    0000000   000          000     000  000   000  000 0 000  
    # 000   000  000  000   000  000       000          000     000  000   000  000  0000  
    # 0000000    000  000   000  00000000   0000000     000     000   0000000   000   000  
                
    changeDirection: (lastDir) ->

        options = @chooseOptions[lastDir]

        i = 0
        s = 0
        while i < options.length
            inv = 1.0/@dirCounts[options[i]]
            s += inv
            i++
            
        r = Math.random() * s
        
        i = options.length-1
        s -= 1.0/@dirCounts[options[i]]
        while i > 0 and r < s
            s -= 1.0/@dirCounts[options[--i]]
            
        nextDir = options[i]
        @dirCounts[nextDir]++
        nextDir
    
    # 000   000  00000000  000   000  000000000  00000000    0000000    0000000  
    # 0000  000  000        000 000      000     000   000  000   000  000       
    # 000 0 000  0000000     00000       000     00000000   000   000  0000000   
    # 000  0000  000        000 000      000     000        000   000       000  
    # 000   000  00000000  000   000     000     000         0000000   0000000   
    
    nextPos: (nextDir) ->
        
        switch nextDir
            
            when 0 # up 
                @pos.y -= 1

            when 1 # left
                if @pos.x%2 == 0 then @pos.y += 1
                @pos.x -= 1

            when 2 # right
                if @pos.x%2 == 0 then @pos.y += 1
                @pos.x += 1
                
            when 3 # down
                @pos.y += 1
            
            when 4 # back right
                if @pos.x%2 == 1 then @pos.y -= 1 
                @pos.x += 1

            when 5 # back left
                if @pos.x%2 == 1 then @pos.y -= 1 
                @pos.x -= 1
        
    # 000   000  00000000  000   000  000000000   0000000   0000000   000       0000000   00000000   
    # 0000  000  000        000 000      000     000       000   000  000      000   000  000   000  
    # 000 0 000  0000000     00000       000     000       000   000  000      000   000  0000000    
    # 000  0000  000        000 000      000     000       000   000  000      000   000  000   000  
    # 000   000  00000000  000   000     000      0000000   0000000   0000000   0000000   000   000  
    
    nextColor: (nextDir) ->
        
        hd = @colorSpeed
        ld = @colorSpeed * 0.1
        switch nextDir                
            when 0
                @red   = clamp 0 1 @red+hd
                @green = clamp 0 1 @green-ld
                @blue  = clamp 0 1 @blue-ld
            when 3
                @red   = clamp 0 1 @red+hd
                @green = clamp 0 1 @green-hd
                @blue  = clamp 0 1 @blue-hd
            when 1
                @red   = clamp 0 1 @red-ld
                @green = clamp 0 1 @green+hd
                @blue  = clamp 0 1 @blue-ld
            when 4
                @red   = clamp 0 1 @red-hd
                @green = clamp 0 1 @green+hd
                @blue  = clamp 0 1 @blue-hd
            when 2
                @red   = clamp 0 1 @red-ld
                @green = clamp 0 1 @green-ld
                @blue  = clamp 0 1 @blue+hd
            when 5
                @red   = clamp 0 1 @red-hd
                @green = clamp 0 1 @green-hd
                @blue  = clamp 0 1 @blue+hd
        
    #  0000000  000   000  0000000    00000000  
    # 000       000   000  000   000  000       
    # 000       000   000  0000000    0000000   
    # 000       000   000  000   000  000       
    #  0000000   0000000   0000000    00000000  
    
    drawCube: (skip) -> 

        s = @cubeSize/2
        x = @pos.x*@cubeSize
        y = (@pos.x%2 == 0) and (@pos.y*@cubeSize) or (@pos.y*@cubeSize - s)
        
        if skip != 0
            @ctx.fillStyle = "rgb(#{@red*255}, #{@green*255}, #{@blue*255})"
            @ctx.beginPath()
            @ctx.moveTo x,   y
            @ctx.lineTo x+@cubeSize, y-s
            @ctx.lineTo x,   y-@cubeSize
            @ctx.lineTo x-@cubeSize, y-s
            @ctx.closePath()
            @ctx.fill()
        
        if skip != 1
            @ctx.fillStyle = "rgb(#{@red*255*0.5}, #{@green*255*0.5}, #{@blue*255*0.5})"
            @ctx.beginPath()
            @ctx.moveTo x,   y
            @ctx.lineTo x-@cubeSize, y-s
            @ctx.lineTo x-@cubeSize, y+s
            @ctx.lineTo x,   y+@cubeSize
            @ctx.closePath()
            @ctx.fill()
        
        if skip != 2
            @ctx.fillStyle = "rgb(#{@red*255*0.2}, #{@green*255*0.2}, #{@blue*255*0.2})"
            @ctx.beginPath()
            @ctx.moveTo x,   y
            @ctx.lineTo x+@cubeSize, y-s
            @ctx.lineTo x+@cubeSize, y+s
            @ctx.lineTo x,   y+@cubeSize
            @ctx.closePath()
            @ctx.fill()
        
module.exports = SaverDefault
rts = SaverDefault
