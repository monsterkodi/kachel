###
 0000000   00000000   00000000    0000000
000   000  000   000  000   000  000     
000000000  00000000   00000000   0000000 
000   000  000        000             000
000   000  000        000        0000000 
###

{ slash, empty, kpos, elem, klog, $, _ } = require 'kxk'

Anny    = require './anny'
exeFind = require './exefind'

class Apps extends Anny
        
    @: (@kachelId:'apps') -> 
    
        super
        
        @main.innerHTML = ''
        @main.style.overflowY = 'auto'
        
        exeFind @onApp, @onDone
        
        @main.addEventListener 'mouseenter' @onMouseEnter, true
        
    onMouseEnter: (event) =>
    
        return if empty event.target.id
        name = slash.base event.target.id

        @base?.remove()
        b = event.target.getBoundingClientRect()
        w = b.right - b.left
        h = b.bottom - b.top
        x = b.left + @main.scrollLeft
        y = b.top  + @main.scrollTop
        
        top   = y + h
        left  = x - w
        width = w * 3
        @base = elem class:'appname' text:name, parent:@main, style:"top:#{top}px; left:#{left}px; width:#{width}px"
        
    onApp: (app) =>
        
        @addApp app
        
    onDone: =>
        
module.exports = Apps
