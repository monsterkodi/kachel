###
0000000     0000000   000   000  000   000  0000000     0000000
000   000  000   000  000   000  0000  000  000   000  000     
0000000    000   000  000   000  000 0 000  000   000  0000000 
000   000  000   000  000   000  000  0000  000   000       000
0000000     0000000    0000000   000   000  0000000    0000000 
###

{ clamp, klog } = require 'kxk'

electron = require 'electron'

class Bounds
    
    @sw: -> electron.screen.getPrimaryDisplay().workAreaSize.width
    @sh: -> electron.screen.getPrimaryDisplay().workAreaSize.height
    @sy: -> electron.screen.getPrimaryDisplay().workAreaSize.y

    @onScreen: (b) ->
        sw = @sw()
        sh = @sh()
        sy = @sy()
        
        b.x = clamp 0, sw - b.width,  b.x
        b.y = clamp 0, sh - b.height, b.y
        
        if b.x + b.width  > sw - b.width then b.x = sw-b.width
        if b.y + b.height > sh - b.height then b.y = sh-b.height
        if b.x < b.width  then b.x = 0
        if b.y - sy < b.height then b.y = sy
        
        b
        
    @onGrid: (b) ->
        klog 'size' @sw(), @sh(), @sy(), electron.screen.getPrimaryDisplay().workAreaSize
        snap = 32
        klog 'snap' b.x, b.x % snap
        if b.x % snap
            klog 'mod' b.x % snap
            # b.x -= b.x % snap
        b
        
    @onGrid2: (b) ->
        
        snap = parseInt b.width/2
        
        if Math.abs(b.x) < snap 
            d = b.x
            b.x -= d
        else if Math.abs(b.x + b.width - @sw()) < snap 
            d = Math.abs(b.x + b.width - @sw())
            b.x += d

        if Math.abs(b.y) < snap 
            d = b.y
            b.y -= d
        else if Math.abs(b.y + b.height - @sh()) < snap 
            d = Math.abs(b.y + b.height - @sh())
            b.y += d
        b
        
    @noOverlap: (b) -> b

module.exports = Bounds
