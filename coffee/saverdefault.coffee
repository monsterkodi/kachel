###
 0000000  000   000  00000000   0000000    00000000  000      000000000
000       000   000  000   000  000   000  000       000         000   
0000000    000 000   0000000    000   000  000000    000         000   
     000     000     000   000  000   000  000       000         000   
0000000       0      000   000  0000000    000       0000000     000   
###

{ sw, sh, elem, kpos, clamp, randRange, randInt, randIntRange, klog } = require 'kxk'
        
electron = require 'electron'
        
class SaverDefault

    constructor: () ->

        document.body.addEventListener 'keydown'   @close
        document.body.addEventListener 'mousedown' @close
        document.body.addEventListener 'mousemove' @moved
        document.body.focus()
    
        @fade = 0
        @w = @h = randIntRange 6 32
        @dirProb = randRange 0.05 0.2
        
        @red   = 0
        @green = 0
        @blue  = 0
        
        @cubeCount = 0
        @lastDir = 0
        @scalef = electron.remote.screen.getPrimaryDisplay().scaleFactor
        @width  = sw()*@scalef
        @height = sh()*@scalef
        
        @pos = kpos randInt(@width/@w), randInt(@height/@h)
                
        @canvas = elem 'canvas' width:@width, height:@height
        @ctx = @canvas.getContext '2d'
        
        if @scalef != 1
            @canvas.style.transform = "translate3d(#{-@width/(2*@scalef)}px, #{-@height/(2*@scalef)}px, 0px) scale3d(0.5, 0.5, 1)"
        
        document.body.appendChild @canvas
        
        # electron.remote.getCurrentWindow().openDevTools()
            
        @fadeOut()

    onFade: ->
        
        steps = 256
        
        @fade += 1
        @ctx.fillStyle = "rgba(0,0,0,#{@fade/steps})"
        @ctx.fillRect 0, 0, @width, @height
        
        @fade < steps
               
    fadeOut: =>
        
        @canvas.width = @canvas.width
        if @onFade()
            window.requestAnimationFrame @fadeOut
        else
            @animation()
            
    animation: =>
        
        if @onFrame()
            window.requestAnimationFrame @animation
        
    moved: (event) =>
        
        @startpos ?= kpos event
        if kpos(event).dist(@startpos) > 10
            @close()
        
    close: =>
        
        document.body.removeEventListener 'keydown'   @close
        document.body.removeEventListener 'mousedown' @close
        document.body.removeEventListener 'mousemove' @close
        
        w = electron.remote.getCurrentWindow()
        w.close()

    # 00000000  00000000    0000000   00     00  00000000  
    # 000       000   000  000   000  000   000  000       
    # 000000    0000000    000000000  000000000  0000000   
    # 000       000   000  000   000  000 0 000  000       
    # 000       000   000  000   000  000   000  00000000  
    
    onFrame: ->

        pos = @pos
        size = kpos parseInt(@width/@w), parseInt(@height/@h)
                       
        nextDir = @lastDir
        
        if Math.random() < @dirProb
            while nextDir == @lastDir or (nextDir+3)%6 == @lastDir
                nextDir = randInt 6
            
        switch nextDir
            
            when 0 # up 
                pos.y -= 1

            when 1 # left
                if pos.x%2 == 0 then pos.y += 1
                pos.x -= 1

            when 2 # right
                if pos.x%2 == 0 then pos.y += 1
                pos.x += 1
                
            when 3 # down
                pos.y += 1
            
            when 4 # back right
                if pos.x%2 == 1 then pos.y -= 1 
                pos.x += 1

            when 5 # back left
                if pos.x%2 == 1 then pos.y -= 1 
                pos.x -= 1
                
        if pos.x < 1 or pos.y < 2 or pos.x >= size.x or pos.y >= size.y # if screen border is touched

            nextDir = randInt 6

            if      pos.x < 1        then pos.x = size.x-1
            else if pos.x > size.x-1 then pos.x = 1
            
            if      pos.y < 2        then pos.y = size.y-2
            else if pos.y > size.y-1 then pos.y = 2
        
        hd = 0.02
        ld = 0.002
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
                        
        skip = null
        if @cubeCount
            switch nextDir
                when 3 then skip = 0
                when 4 then skip = 1
                when 5 then skip = 2
        
        @drawCube skip
        
        @cubeCount += 1
        @lastDir = nextDir
        
        true
    
    #  0000000  000   000  0000000    00000000  
    # 000       000   000  000   000  000       
    # 000       000   000  0000000    0000000   
    # 000       000   000  000   000  000       
    #  0000000   0000000   0000000    00000000  
    
    drawCube: (skip) -> 

        s = @h/2
        x = @pos.x*@w
        y = (@pos.x%2 == 0) and (@pos.y*@h) or (@pos.y*@h - s)
        
        if skip != 0
            @ctx.fillStyle = "rgb(#{@red*255}, #{@green*255}, #{@blue*255})"
            @ctx.beginPath()
            @ctx.moveTo x,   y
            @ctx.lineTo x+@w, y-s
            @ctx.lineTo x,   y-@h
            @ctx.lineTo x-@w, y-s
            @ctx.closePath()
            @ctx.fill()
        
        if skip != 1
            @ctx.fillStyle = "rgb(#{@red*255*0.5}, #{@green*255*0.5}, #{@blue*255*0.5})"
            @ctx.beginPath()
            @ctx.moveTo x,   y
            @ctx.lineTo x-@w, y-s
            @ctx.lineTo x-@w, y+s
            @ctx.lineTo x,   y+@h
            @ctx.closePath()
            @ctx.fill()
        
        if skip != 2
            @ctx.fillStyle = "rgb(#{@red*255*0.2}, #{@green*255*0.2}, #{@blue*255*0.2})"
            @ctx.beginPath()
            @ctx.moveTo x,   y
            @ctx.lineTo x+@w, y-s
            @ctx.lineTo x+@w, y+s
            @ctx.lineTo x,   y+@h
            @ctx.closePath()
            @ctx.fill()
        
module.exports = SaverDefault
