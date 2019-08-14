###
000   000  000000000  000  000       0000000
000   000     000     000  000      000     
000   000     000     000  000      0000000 
000   000     000     000  000           000
 0000000      000     000  0000000  0000000 
###

{ elem, clamp, klog, deg2rad } = require 'kxk'

class utils
    
    @opt = (e,o) ->
        
        if o?
            for k in Object.keys o
                e.setAttribute k, o[k]
        e

    @append: (p,t,o) ->
        
        e = document.createElementNS "http://www.w3.org/2000/svg" t
        p.appendChild @opt e, o
        e
        
    @svg: (width:100, height:100, clss:) ->
        
        svg = document.createElementNS 'http://www.w3.org/2000/svg' 'svg'
        svg.setAttribute 'viewBox' '-50 -50 100 100'
        svg.setAttribute 'class' clss if clss
        svg
        
    @circle: (radius:50, cx:0, cy:0, clss:, svg:) ->
        
        svg ?= @svg width:2*radius, height:2*radius
        g = @append svg, 'g'
        c = @append g, 'circle', cx:cx, cy:cy, r:radius, class:clss
        svg
        
    @pie: (radius:50, cx:0, cy:0, angle:0, start:0, clss:, svg:) ->

        # if angle == start
            # return svg
            
        # if angle > start and (angle-start)%360 == 0
            # return @circle radius:radius, cx:cx, cy:cy, clss:clss, svg:svg
        
        start = clamp 0 360 start%360
        angle = clamp 0 360 (start+angle)%360
        
        svg ?= @svg width:2*radius, height:2*radius
        g    = @append svg, 'g'
        pie  = @append g, 'path' class:clss
        
        sx = cx + radius * Math.sin deg2rad angle
        sy = cy - radius * Math.cos deg2rad angle
        ex = cx + radius * Math.sin deg2rad start
        ey = cy - radius * Math.cos deg2rad start
        
        f = angle-start <= 180 and '0 0' or '1 0'
        pie.setAttribute 'd' "M #{cx} #{cy} L #{sx} #{sy} A #{radius} #{radius} #{start} #{f} #{ex} #{ey} z"
        # A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            
        pie

module.exports = utils
