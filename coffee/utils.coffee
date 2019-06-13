###
000   000  000000000  000  000       0000000
000   000     000     000  000      000     
000   000     000     000  000      0000000 
000   000     000     000  000           000
 0000000      000     000  0000000  0000000 
###

{ elem, clamp, deg2rad } = require 'kxk'

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
        
    @svg: (width:55, height:55) ->
        
        svg = document.createElementNS 'http://www.w3.org/2000/svg' 'svg'
        svg.setAttribute 'width'  "#{width}px"
        svg.setAttribute 'height' "#{height}px"
        svg
        
    @circle: (radius:27.5, cx:27.5, cy:27.5, fill:'white', svg:) ->
        
        svg ?= @svg width:2*radius, height:2*radius
        g    = @append svg, 'g'
        @append g, 'circle', cx:cx, cy:cy, r:radius, fill:fill
        svg
        
    @pie: (radius:27.5, cx:27.5, cy:27.5, angle:0, start:0, fill:'white', svg:) ->

        angle = clamp 0, 360, angle%360
        start = clamp 0, 360, start%360
        
        svg ?= @svg width:2*radius, height:2*radius
        g    = @append svg, 'g'
        pie  = @append g, 'path', fill:fill
        
        x = cx + radius * Math.sin deg2rad angle
        y = cy - radius * Math.cos deg2rad angle
        f = angle <= 180 and '0 0' or '1 0'
        pie.setAttribute 'd', "M #{cx} #{cy} L #{x} #{y} A #{radius} #{radius} #{start} #{f} #{cx} #{cy-radius} z"
        # A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            
        svg

module.exports = utils
