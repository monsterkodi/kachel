###
 0000000  000   000   0000000   000  000   000
000       000   000  000   000  000  0000  000
000       000000000  000000000  000  000 0 000
000       000   000  000   000  000  000  0000
 0000000  000   000  000   000  000  000   000
###

{ post, slash, klog, elem, os, _ } = require 'kxk'

electron = require 'electron'
Kachel   = require './kachel'
Bounds   = require './bounds'

class Chain extends Kachel
        
    @: (@kachelId:'chain') -> 
        
        super
        @setIcon __dirname + '/../img/menu.png'
        
        @win.setResizable true
        @win.setMinimumSize Bounds.kachelSizes[0], Bounds.kachelSizes[0]
        @win.setMaximumSize Bounds.kachelSizes[-1], Bounds.kachelSizes[-1]
        
        @win.on 'resize' @onResize
        
    onResize: (event) =>
        
        clearTimeout @snapTimer
        @snapTimer = setTimeout @snapSize, 150
        
    snapSize: =>
        
        br = @win.getBounds()
        
        for i in [0...Bounds.kachelSizes.length-1]
            if br.width < Bounds.kachelSizes[i] + (Bounds.kachelSizes[i+1] - Bounds.kachelSizes[i]) / 2
                br.width = Bounds.kachelSizes[i]
                break
        br.width = Math.min br.width, Bounds.kachelSizes[-1]
                
        for i in [0...Bounds.kachelSizes.length-1]
            if br.height < Bounds.kachelSizes[i] + (Bounds.kachelSizes[i+1] - Bounds.kachelSizes[i]) / 2
                br.height = Bounds.kachelSizes[i]
                break
        br.height = Math.min br.height, Bounds.kachelSizes[-1]
        
        @win.setBounds br

module.exports = Chain
