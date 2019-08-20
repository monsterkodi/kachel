###
 0000000  000   000   0000000   000  000   000
000       000   000  000   000  000  0000  000
000       000000000  000000000  000  000 0 000
000       000   000  000   000  000  000  0000
 0000000  000   000  000   000  000  000   000
###

{ post, slash, valid, klog, elem, os, _ } = require 'kxk'

electron = require 'electron'
Kachel   = require './kachel'
Bounds   = require './bounds'
utils    = require './utils'

class Chain extends Kachel
        
    @: (@kachelId:'chain') -> 
        
        super
        
        @win.setResizable true
        @win.setMinimumSize Bounds.kachelSizes[0], Bounds.kachelSizes[0]
        @win.setMaximumSize Bounds.kachelSizes[-1], Bounds.kachelSizes[-1]
        
        @win.on 'resize' @onResize
        
        @directions = ['down' 'left' 'up' 'right']
        @dir = 0
        @updateDir()
        
        @lastBounds = @win.getBounds()
        
    collectNeighbors: ->
        @neighbors = Bounds.inlineKacheln @win, @directions[@dir]
        @neighborBounds = []
        for n in @neighbors ? []
            @neighborBounds.push n.getBounds()
        
    # onDragStart: (drag, event) =>
#     
        # @collectNeighbors()
        # super drag, event
#         
    # onDragMove: (drag, event) =>
        # super drag, event
    
    onMove: (event) =>

        newBounds = @win.getBounds()
        dx = newBounds.x - @lastBounds.x
        dy = newBounds.y - @lastBounds.y

        if (dx or dy) and valid @neighbors
            for i in [0...@neighbors.length]
                @neighbors[i].setPosition @neighborBounds[i].x+dx, @neighborBounds[i].y+dy
                @neighbors[i].setSize     @neighborBounds[i].width, @neighborBounds[i].height
                @neighborBounds[i] = @neighbors[i].getBounds()
        
        @lastBounds = newBounds
        
    # onDragStop: (drag, event) =>     

        # @dragStopBounds = @win.getBounds()
        # @neighborBounds = []
        # for n in @neighbors ? []
            # @neighborBounds.push n.getBounds()
#             
        # super drag, event
#         
    # onSaveBounds: =>
#         
        # if @dragStopBounds and valid @neighbors
            # klog 'chain save bounds'
            # b = @win.getBounds()
            # dx = b.x - @dragStopBounds.x
            # dy = b.y - @dragStopBounds.y
            # for i in [0...@neighbors.length]
                # @neighbors[i].setPosition @neighborBounds[i].x + dx, @neighborBounds[i].y + dy
                # @neighbors[i].setSize     @neighborBounds[i].width, @neighborBounds[i].height
                # post.toWin @neighbors.id, 'saveBounds'
            # delete @dragStopBounds
        # super
        
    onResize: (event) =>
        
        clearTimeout @snapTimer
        @snapTimer = setTimeout @snapSize, 150
        
    onRightClick: => 
        
        @dir = (@dir+1) % @directions.length
        @updateDir()
        @collectNeighbors()
        
    updateDir: =>
        
        @arrow?.remove()
        @arrow = utils.svg clss:'chain'
        g = utils.append @arrow, 'g'
        switch @dir
            when 0 then p = utils.append g, 'path' d:"M-25 0 L0 50 L25 0 Z"
            when 1 then p = utils.append g, 'path' d:"M0 -25 L-50 0 L0 25 Z"
            when 2 then p = utils.append g, 'path' d:"M-25 0 L0 -50 L25 0 Z"
            when 3 then p = utils.append g, 'path' d:"M0 -25 L50 0 L0 25 Z"
        @main.appendChild @arrow
        
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
