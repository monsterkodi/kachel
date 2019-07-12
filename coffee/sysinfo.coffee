###
 0000000  000   000   0000000  000  000   000  00000000   0000000   
000        000 000   000       000  0000  000  000       000   000  
0000000     00000    0000000   000  000 0 000  000000    000   000  
     000     000          000  000  000  0000  000       000   000  
0000000      000     0000000   000  000   000  000        0000000   
###

{ elem, post, elem, empty, klog, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Sysinfo extends Kachel
        
    @: (@kachelId:'sysinfo') -> 
        
        super
        
        @history = 
            net: []
            dsk: []
            cpu: []
        @max = 
            net: [0 0]
            dsk: [0 0]
            cpu: [0 0]
            
        @colors =
            net: [[  0 100   0] [  0  70  0]] 
            dsk: [[100 100 100] [ 70  70 70]] 
            cpu: [[255 255   0] [255 100  0]] 
        @tops = 
            dsk: '0%'
            net: '33%'
            cpu: '66%'
        
        post.toMain 'requestData' 'sysdata' @id
        post.on 'data' @onData
        
    # 0000000     0000000   000   000  000   000  0000000     0000000  
    # 000   000  000   000  000   000  0000  000  000   000  000       
    # 0000000    000   000  000   000  000 0 000  000   000  0000000   
    # 000   000  000   000  000   000  000  0000  000   000       000  
    # 0000000     0000000    0000000   000   000  0000000    0000000   
    
    onBounds: ->
        
        @main.innerHTML = ''
        
        br = @main.getBoundingClientRect()
        w = parseInt br.width
        h = parseInt br.height/3
        
        @width  = w*2
        @height = h*2
        
        @canvas = {}            
        for n in ['dsk' 'net' 'cpu']
            canvas = elem 'canvas' class:"histCanvas" width:@width-1 height:@height
            x = parseInt -@width/4
            y = parseInt  -@height/4
            canvas.style.transform = "translate3d(#{x}px, #{y}px, 0px) scale3d(0.5, 0.5, 1)"
            canvas.style.top = @tops[n]
            @main.appendChild canvas
            @canvas[n] = canvas
            
    # 0000000     0000000   000000000   0000000   
    # 000   000  000   000     000     000   000  
    # 000   000  000000000     000     000000000  
    # 000   000  000   000     000     000   000  
    # 0000000    000   000     000     000   000  
    
    onData: (data) =>
        
        for n in ['dsk' 'net' 'cpu']
            hist = @history[n]
            switch n
                when 'dsk' then if data.disksIO? 
                                hist.push [data.disksIO.rIO_sec, data.disksIO.wIO_sec]
                when 'net' then hist.push [data.networkStats[0].rx_sec, data.networkStats[0].tx_sec]
                when 'cpu' then hist.push [data.currentLoad.currentload/100, data.currentLoad.currentload_user/100]
                
            continue if empty hist
            
            hist.shift() while hist.length > @width
                
            canvas = @canvas[n]
            canvas.height = canvas.height
            ctx = canvas.getContext '2d'
            max = [@max[n][0], @max[n][1]]
            for m in [0,1]
                ctx.fillStyle = "rgb(#{@colors[n][m][0]}, #{@colors[n][m][1]}, #{@colors[n][m][2]})"
                for i in [0...hist.length]
                    if n == 'cpu'
                        if m
                            h = @height * (hist[i][0]-hist[i][1])
                            l = @height * hist[i][0]
                            ctx.fillRect @width-hist.length+i, @height-l, 2, h
                        else
                            # h = @height * (hist[i][0]-hist[i][1])
                            h = @height * hist[i][1]
                            ctx.fillRect @width-hist.length+i, @height-h, 2, h
                    else
                        @max[n][m] = Math.max hist[i][m], @max[n][m]
                        h = @height/2 * hist[i][m] / max[m]
                        if m 
                            ctx.fillRect @width-hist.length+i, @height/2-h, 2, h
                        else
                            ctx.fillRect @width-hist.length+i, @height/2, 2, h
                        
module.exports = Sysinfo
