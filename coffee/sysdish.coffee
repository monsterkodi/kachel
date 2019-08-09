###
 0000000  000   000   0000000  0000000    000   0000000  000   000  
000        000 000   000       000   000  000  000       000   000  
0000000     00000    0000000   000   000  000  0000000   000000000  
     000     000          000  000   000  000       000  000   000  
0000000      000     0000000   0000000    000  0000000   000   000  
###

{ post, empty, elem, klog, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Sysdish extends Kachel
        
    @: (@kachelId:'sysdish') -> 
        
        super
        
        @mode = 'dish'
        
        @history = 
            net: []
            dsk: []
            cpu: []
            
        @max = 
            net: [100 100]
            dsk: [1 1]
            cpu: [1 1]
            
        @colors =
            dsk: [[128 128 255] [ 64  64 255]]
            net: [[  0 150   0] [  0 255   0]]
            cpu: [[255 255   0] [255 100   0]]
            
        @tops = 
            net: '0%'
            dsk: '33%'
            cpu: '66%'
        
        @requestData 'sysinfo'
    
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onContextMenu: => @onClick()
    onClick: =>
        
        if @mode == 'dish' then @graphMode()
        else @dishMode()
        
    graphMode: ->
        
        @mode = 'graph'
        @onBounds()
        @drawGraph()
        
    dishMode: ->
        
        @mode = 'dish'
        @drawDish()
        
    #  0000000   000   000  0000000     0000000   000000000   0000000   
    # 000   000  0000  000  000   000  000   000     000     000   000  
    # 000   000  000 0 000  000   000  000000000     000     000000000  
    # 000   000  000  0000  000   000  000   000     000     000   000  
    #  0000000   000   000  0000000    000   000     000     000   000  
    
    onData: (@data) =>
        
        for n in ['dsk' 'net' 'cpu']
            hist = @history[n]
            switch n
                when 'dsk' 
                    if @data.dsk? 
                                hist.push [@data.dsk.r_sec,  @data.dsk.w_sec]
                    else
                                hist.push [@data.mem.active/@data.mem.total, @data.mem.used/@data.mem.total]
                when 'cpu' then hist.push [@data.cpu.sys,    @data.cpu.usr]
                when 'net' then hist.push [@data.net.rx_sec, @data.net.tx_sec]
                
            hist.shift() while hist.length > @width
                
        if @mode == 'dish'
            @drawDish()
        else
            @drawGraph()
        
    # 0000000    00000000    0000000   000   000   0000000   00000000    0000000   00000000   000   000  
    # 000   000  000   000  000   000  000 0 000  000        000   000  000   000  000   000  000   000  
    # 000   000  0000000    000000000  000000000  000  0000  0000000    000000000  00000000   000000000  
    # 000   000  000   000  000   000  000   000  000   000  000   000  000   000  000        000   000  
    # 0000000    000   000  000   000  00     00   0000000   000   000  000   000  000        000   000  
    
    drawGraph: ->
        
        for n in ['dsk' 'net' 'cpu']
            
            hist = @history[n]
            continue if empty hist
                        
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
                            ctx.fillRect @width-hist.length+i, @height-l, 1, h
                        else
                            h = @height * hist[i][1]
                            ctx.fillRect @width-hist.length+i, @height-h, 2, h
                    else
                        @max[n][m] = Math.max hist[i][m], @max[n][m]
                        h = (hist[i][m] / max[m]) * @height/2
                        if m 
                            ctx.fillRect @width-hist.length+i, @height/2-h, 2, h
                        else
                            ctx.fillRect @width-hist.length+i, @height/2, 2, h
                
    # 0000000    00000000    0000000   000   000  0000000    000   0000000  000   000  
    # 000   000  000   000  000   000  000 0 000  000   000  000  000       000   000  
    # 000   000  0000000    000000000  000000000  000   000  000  0000000   000000000  
    # 000   000  000   000  000   000  000   000  000   000  000       000  000   000  
    # 0000000    000   000  000   000  00     00  0000000    000  0000000   000   000  
    
    drawDish: ->
                
        @main.innerHTML = ''
        svg = utils.svg clss:'clock'
        @main.appendChild svg
        
        # 000   0000000   
        # 000  000   000  
        # 000  000   000  
        # 000  000   000  
        # 000   0000000   
        
        if @data.dsk?
        
            pie = utils.circle clss:'sysdish_disk_bgr' svg:svg
            utils.pie svg:pie, clss:'sysdish_disk_read'  angle:180*@data.dsk.r_sec/@data.dsk.r_max
            utils.pie svg:pie, clss:'sysdish_disk_write' angle:180*@data.dsk.w_sec/@data.dsk.w_max, start:180
        
        # 000   000  00000000  000000000  
        # 0000  000  000          000     
        # 000 0 000  0000000      000     
        # 000  0000  000          000     
        # 000   000  00000000     000     
                
        pie = utils.circle radius:47 clss:'sysdish_net_bgr' svg:svg
        utils.pie svg:pie, radius:47 clss:'sysdish_net_recv' angle:180*@data.net.rx_sec/@data.net.rx_max
        utils.pie svg:pie, radius:47 clss:'sysdish_net_send' angle:180*@data.net.tx_sec/@data.net.tx_max, start:180
            
        # 000       0000000    0000000   0000000    
        # 000      000   000  000   000  000   000  
        # 000      000   000  000000000  000   000  
        # 000      000   000  000   000  000   000  
        # 0000000   0000000   000   000  0000000    
        
        pie = utils.circle radius:44 clss:'sysdish_load_bgr' svg:svg
        utils.pie svg:pie, radius:44 clss:'sysdish_load_sys' angle:360*@data.cpu.sys
        utils.pie svg:pie, radius:44 clss:'sysdish_load_usr' angle:360*@data.cpu.usr
            
        # 00     00  00000000  00     00  
        # 000   000  000       000   000  
        # 000000000  0000000   000000000  
        # 000 0 000  000       000 0 000  
        # 000   000  00000000  000   000  
        
        pie = utils.circle radius:18 clss:'sysdish_mem_bgr' svg:svg
        utils.pie svg:pie, radius:18 clss:'sysdish_mem_used'   angle:360*@data.mem.used/@data.mem.total
        utils.pie svg:pie, radius:18 clss:'sysdish_mem_active' angle:360*@data.mem.active/@data.mem.total
            
    # 0000000     0000000   000   000  000   000  0000000     0000000  
    # 000   000  000   000  000   000  0000  000  000   000  000       
    # 0000000    000   000  000   000  000 0 000  000   000  0000000   
    # 000   000  000   000  000   000  000  0000  000   000       000  
    # 0000000     0000000    0000000   000   000  0000000    0000000   
    
    onBounds: ->
        
        return if @mode != 'graph'
        
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
            y = parseInt -@height/4
            canvas.style.transform = "translate3d(#{x}px, #{y}px, 0px) scale3d(0.5, 0.5, 1)"
            canvas.style.top = @tops[n]
            @main.appendChild canvas
            @canvas[n] = canvas
        
module.exports = Sysdish
