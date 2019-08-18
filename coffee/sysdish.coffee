###
 0000000  000   000   0000000  0000000    000   0000000  000   000  
000        000 000   000       000   000  000  000       000   000  
0000000     00000    0000000   000   000  000  0000000   000000000  
     000     000          000  000   000  000       000  000   000  
0000000      000     0000000   0000000    000  0000000   000   000  
###

{ post, empty, clamp, last, deg2rad, elem, klog, _ } = require 'kxk'

utils   = require './utils'
Kachel  = require './kachel'

class Sysdish extends Kachel
        
    @: (@kachelId:'sysdish') -> 
        
        super
        
        @animCount = 0
        
        @history = 
            net: []
            dsk: []
            cpu: []
            
        @colors =
            dsk: [[128 128 255] [ 64  64 255]]
            net: [[  0 150   0] [  0 255   0]]
            cpu: [[255 255   0] [255 100   0]]
            
        @tops = 
            net: '0%'
            dsk: '33%'
            cpu: '66%'
        
        @requestData 'sysinfo'
        
        @dishMode()
    
    #  0000000  000      000   0000000  000   000  
    # 000       000      000  000       000  000   
    # 000       000      000  000       0000000    
    # 000       000      000  000       000  000   
    #  0000000  0000000  000   0000000  000   000  
    
    onRightClick: => @onLeftClick()
    onLeftClick: =>
        
        if @mode == 'dish' then @graphMode()
        else @dishMode()
        
    graphMode: ->
        
        @mode = 'graph'
        @onBounds()
        @drawGraph()
        
    dishMode: ->
                
        @mode = 'dish'
        @initDish()
        @drawDish()
        @animDish()
        
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
                                hist.push [@data.dsk.r_fac,  @data.dsk.w_fac]
                    else
                                hist.push [@data.mem.active/@data.mem.total, @data.mem.used/@data.mem.total]
                when 'cpu' then hist.push [@data.cpu.sys,    @data.cpu.usr]
                when 'net' then hist.push [@data.net.rx_fac, @data.net.tx_fac]
             
            hist.shift() while hist.length > @width
                
        if @mode == 'dish'
            @drawDish()
            @animDish()
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
                        h = hist[i][m] * @height/2
                        if m 
                            ctx.fillRect @width-hist.length+i, @height/2-h, 2, h
                        else
                            ctx.fillRect @width-hist.length+i, @height/2, 2, h
                
    #  0000000   000   000  000  00     00  0000000    000   0000000  000   000  
    # 000   000  0000  000  000  000   000  000   000  000  000       000   000  
    # 000000000  000 0 000  000  000000000  000   000  000  0000000   000000000  
    # 000   000  000  0000  000  000 0 000  000   000  000       000  000   000  
    # 000   000  000   000  000  000   000  0000000    000  0000000   000   000  
    
    animDish: =>
        
        clearTimeout @animTimer
        
        return if not @data
        
        @animCount += 1
        if @animCount <= 30

            pie180 = (pie, radius, angle, start=0) ->
                angle = clamp 0, 180, angle
                sx =  radius * Math.sin deg2rad start+angle
                sy = -radius * Math.cos deg2rad start+angle
                ex =  radius * Math.sin deg2rad start
                ey = -radius * Math.cos deg2rad start
                pie.setAttribute 'd' "M 0 0 L #{sx} #{sy} A #{radius} #{radius} #{start} 0 0 #{ex} #{ey} z"
            
            pie360 = (pie, radius, angle) ->
                angle = clamp 0, 359, angle
                sx =  radius * Math.sin deg2rad angle
                sy = -radius * Math.cos deg2rad angle
                ex =  0
                ey = -radius
                f = angle <= 180 and '0 0' or '1 0'
                pie.setAttribute 'd' "M 0 0 L #{sx} #{sy} A #{radius} #{radius} 0 #{f} #{ex} #{ey} z"
            
            if @data.dsk?
                 
                @dskrNow += (@dskrNew - @dskrOld) / 30
                @dskwNow += (@dskwNew - @dskwOld) / 30
                 
                pie180 @dskrPie, 50, @dskrNow
                pie180 @dskwPie, 50, @dskwNow, 180
                             
            @netrNow += (@netrNew - @netrOld) / 30
            @nettNow += (@nettNew - @nettOld) / 30
             
            pie180 @netrPie, 47, @netrNow
            pie180 @nettPie, 47, @nettNow, 180
            
            @sysNow += (@sysNew - @sysOld) / 30
            @usrNow += (@usrNew - @usrOld) / 30
            
            pie360 @usrPie, 44, @usrNow
            pie360 @sysPie, 44, @sysNow
            
            @memuNow += (@memuNew - @memuOld) / 30
            @memaNow += (@memaNew - @memaOld) / 30
            
            pie360 @memuPie, 18, @memuNow
            pie360 @memaPie, 18, @memaNow
                            
        if @mode == 'dish'
            @animTimer = setTimeout @animDish, 1000 / 30
    
    # 000  000   000  000  000000000  0000000    000   0000000  000   000  
    # 000  0000  000  000     000     000   000  000  000       000   000  
    # 000  000 0 000  000     000     000   000  000  0000000   000000000  
    # 000  000  0000  000     000     000   000  000       000  000   000  
    # 000  000   000  000     000     0000000    000  0000000   000   000  
    
    initDish: ->
        
        @main.innerHTML = ''
        svg = utils.svg clss:'clock'
        @main.appendChild svg
        
        pie = utils.circle clss:'sysdish_disk_bgr' svg:svg
        @dskrPie = utils.pie svg:pie, radius:50 clss:'sysdish_disk_read'  angle:0
        @dskwPie = utils.pie svg:pie, radius:50 clss:'sysdish_disk_write' angle:0, start:180
        
        pie = utils.circle radius:47 clss:'sysdish_net_bgr' svg:svg
        @netrPie = utils.pie svg:pie, radius:47 clss:'sysdish_net_recv' angle:0
        @nettPie = utils.pie svg:pie, radius:47 clss:'sysdish_net_send' angle:0 start:180
            
        pie = utils.circle radius:44 clss:'sysdish_load_bgr' svg:svg
        @sysPie = utils.pie svg:pie, radius:44 clss:'sysdish_load_sys' angle:0
        @usrPie = utils.pie svg:pie, radius:44 clss:'sysdish_load_usr' angle:0

        pie = utils.circle radius:18 clss:'sysdish_mem_bgr' svg:svg
        @memuPie = utils.pie svg:pie, radius:18 clss:'sysdish_mem_used'   angle:0
        @memaPie = utils.pie svg:pie, radius:18 clss:'sysdish_mem_active' angle:0
            
        
     # 0000000    00000000    0000000   000   000  0000000    000   0000000  000   000
     # 000   000  000   000  000   000  000 0 000  000   000  000  000       000   000
     # 000   000  0000000    000000000  000000000  000   000  000  0000000   000000000
     # 000   000  000   000  000   000  000   000  000   000  000       000  000   000
     # 0000000    000   000  000   000  00     00  0000000    000  0000000   000   000

     drawDish: ->

         return if not @data

         @animCount = 0

         if @data.dsk?

             @dskrOld = @dskrNow = @dskrNew
             @dskwOld = @dskwNow = @dskwNew

             @dskrNew = 180*@data.dsk.r_sec/@data.dsk.r_max
             @dskwNew = 180*@data.dsk.w_sec/@data.dsk.w_max
             
         @netrOld = @netrNow = @netrNew
         @nettOld = @nettNow = @nettNew

         
         @netrNew = 180*@data.net.rx_sec/@data.net.rx_max
         @nettNew = 180*@data.net.tx_sec/@data.net.tx_max

         if Number.isNaN @netrNew # remove me!
            klog @data.net        # remove me!
         
         @sysOld = @sysNow = @sysNew
         @usrOld = @usrNow = @usrNew

         @sysNew = 360*@data.cpu.sys
         @usrNew = 360*@data.cpu.usr

         @memuOld = @memuNow = @memuNew
         @memaOld = @memaNow = @memaNew

         @memuNew = 360*@data.mem.used/@data.mem.total
         @memaNew = 360*@data.mem.active/@data.mem.total
        
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
